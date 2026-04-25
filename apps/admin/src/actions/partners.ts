'use server'
import { db } from '@/db'
import { partners, chapterFeaturedPartners, flashDeals, user } from '@/db/schema'
import { eq, and, isNotNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createId } from '@paralleldrive/cuid2'

// ─── Push notification helper ──────────────────────────────────────────────
async function sendExpoPush(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  const valid = tokens.filter((t) => t.startsWith('ExponentPushToken['))
  if (valid.length === 0) return

  try {
    // Expo push API accepts up to 100 messages per request
    const chunks: string[][] = []
    for (let i = 0; i < valid.length; i += 100) chunks.push(valid.slice(i, i + 100))

    await Promise.all(
      chunks.map((chunk) =>
        fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(chunk.map((to) => ({ to, sound: 'default', title, body, data: data ?? {} }))),
        })
      )
    )
  } catch (err) {
    // Non-fatal — never let push failures block the action
    console.warn('[Push] Failed to send flash deal notifications:', err)
  }
}

// Parse comma-separated tags from form
function parseTags(raw: string): string[] {
  return raw.split(',').map((t) => t.trim()).filter(Boolean)
}

// Parse photos — newline or comma separated URLs
function parsePhotos(raw: string): string[] {
  return raw.split(/[\n,]/).map((u) => u.trim()).filter(Boolean)
}

// Parse opening hours from individual form fields
function parseOpeningHours(formData: FormData): Record<string, string> | null {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const hours: Record<string, string> = {}
  for (const day of days) {
    const val = (formData.get(`hours_${day}`) as string)?.trim()
    if (val) hours[day] = val
  }
  const note = (formData.get('hours_note') as string)?.trim()
  if (note) hours.note = note
  return Object.keys(hours).length > 0 ? hours : null
}

export async function createPartner(formData: FormData) {
  const tagsRaw = (formData.get('tags') as string) || ''
  const photosRaw = (formData.get('photos') as string) || ''

  await db.insert(partners).values({
    id: createId(),
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    tagline: formData.get('tagline') as string,
    description: formData.get('description') as string,
    lat: parseFloat(formData.get('lat') as string),
    lng: parseFloat(formData.get('lng') as string),
    address: (formData.get('address') as string) || null,
    district: (formData.get('district') as string) || null,
    province: formData.get('province') as string,
    phone: (formData.get('phone') as string) || null,
    whatsapp: (formData.get('whatsapp') as string) || null,
    website: (formData.get('website') as string) || null,
    tier: formData.get('tier') as string,
    photos: parsePhotos(photosRaw),
    priceMin: formData.get('priceMin') ? parseInt(formData.get('priceMin') as string) : null,
    priceMax: formData.get('priceMax') ? parseInt(formData.get('priceMax') as string) : null,
    tags: parseTags(tagsRaw),
    openingHours: parseOpeningHours(formData),
    isLocal: formData.get('isLocal') === 'on',
    isApproved: formData.get('isApproved') === 'on',
    isActive: true,
  })

  revalidatePath('/partners')
  redirect('/partners')
}

export async function updatePartner(id: string, formData: FormData): Promise<{ error?: string }> {
  try {
    const tagsRaw = (formData.get('tags') as string) || ''
    const photosRaw = (formData.get('photos') as string) || ''

    await db.update(partners).set({
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      tagline: formData.get('tagline') as string,
      description: formData.get('description') as string,
      lat: parseFloat(formData.get('lat') as string),
      lng: parseFloat(formData.get('lng') as string),
      address: (formData.get('address') as string) || null,
      district: (formData.get('district') as string) || null,
      province: formData.get('province') as string,
      phone: (formData.get('phone') as string) || null,
      whatsapp: (formData.get('whatsapp') as string) || null,
      website: (formData.get('website') as string) || null,
      tier: formData.get('tier') as string,
      photos: parsePhotos(photosRaw),
      priceMin: formData.get('priceMin') ? parseInt(formData.get('priceMin') as string) : null,
      priceMax: formData.get('priceMax') ? parseInt(formData.get('priceMax') as string) : null,
      tags: parseTags(tagsRaw),
      openingHours: parseOpeningHours(formData),
      isLocal: formData.get('isLocal') === 'on',
      isApproved: formData.get('isApproved') === 'on',
    }).where(eq(partners.id, id))

    revalidatePath('/partners')
    revalidatePath(`/partners/${id}`)
    return {}
  } catch (err) {
    console.error('updatePartner error:', err)
    return { error: 'Failed to save. Please try again.' }
  }
}

export async function toggleApproved(id: string, current: boolean) {
  await db.update(partners).set({ isApproved: !current }).where(eq(partners.id, id))
  revalidatePath('/partners')
  revalidatePath(`/partners/${id}`)
}

export async function toggleActive(id: string, current: boolean) {
  await db.update(partners).set({ isActive: !current }).where(eq(partners.id, id))
  revalidatePath('/partners')
}

export async function deletePartner(id: string) {
  await db.delete(partners).where(eq(partners.id, id))
  revalidatePath('/partners')
  redirect('/partners')
}

// --- Featured partners for a chapter ---
export async function addFeaturedPartner(chapterId: string, partnerId: string, displayOrder: number) {
  await db.insert(chapterFeaturedPartners)
    .values({ chapterId, partnerId, displayOrder })
    .onConflictDoNothing()
  revalidatePath(`/chapters/${chapterId}`)
}

export async function removeFeaturedPartner(chapterId: string, partnerId: string) {
  await db.delete(chapterFeaturedPartners)
    .where(and(
      eq(chapterFeaturedPartners.chapterId, chapterId),
      eq(chapterFeaturedPartners.partnerId, partnerId),
    ))
  revalidatePath(`/chapters/${chapterId}`)
}

// --- Flash Deals ---
export async function createFlashDeal(formData: FormData) {
  const partnerId = formData.get('partnerId') as string
  const title = formData.get('title') as string
  const discountText = formData.get('discountText') as string

  await db.insert(flashDeals).values({
    id: createId(),
    partnerId,
    title,
    description: (formData.get('description') as string) || null,
    discountText,
    claimCode: formData.get('claimCode') as string,
    startsAt: new Date(formData.get('startsAt') as string),
    expiresAt: new Date(formData.get('expiresAt') as string),
    radiusMeters: parseInt((formData.get('radiusMeters') as string) || '1500'),
    minCoins: parseInt((formData.get('minCoins') as string) || '200'),
    isActive: true,
  })

  // Fire-and-forget push notifications to all users who have a push token
  // (location-based filtering happens on the mobile side when they open the app)
  const partner = await db
    .select({ name: partners.name, province: partners.province })
    .from(partners)
    .where(eq(partners.id, partnerId))
    .limit(1)
    .then((r) => r[0])

  if (partner) {
    const users = await db
      .select({ pushToken: user.pushToken })
      .from(user)
      .where(isNotNull(user.pushToken))

    const tokens = users.map((u) => u.pushToken!).filter(Boolean)

    // Non-blocking — don't await so the action returns immediately
    sendExpoPush(
      tokens,
      `⚡ Flash Deal at ${partner.name}`,
      `${discountText} — ${title}. Limited time only!`,
      { screen: 'flash-deals' },
    )
  }

  revalidatePath('/partners')
}

export async function toggleDealActive(id: string, current: boolean) {
  await db.update(flashDeals).set({ isActive: !current }).where(eq(flashDeals.id, id))
  revalidatePath('/partners')
}
