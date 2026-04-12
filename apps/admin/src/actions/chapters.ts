'use server'
import { db } from '@/db'
import { chapters } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createId } from '@paralleldrive/cuid2'

function parseBeforeYouGo(formData: FormData) {
  const bestTime = formData.get('bestTime') as string
  const dresscode = formData.get('dresscode') as string
  const entryFee = formData.get('entryFee') as string
  const etiquette = formData.get('etiquette') as string

  const obj: Record<string, string> = {}
  if (bestTime) obj.bestTime = bestTime
  if (dresscode) obj.dresscode = dresscode
  if (entryFee) obj.entryFee = entryFee
  if (etiquette) obj.etiquette = etiquette
  return Object.keys(obj).length > 0 ? obj : null
}

export async function createChapter(arcId: string, formData: FormData) {
  const order = parseInt(formData.get('order') as string, 10)
  const title = formData.get('title') as string
  const loreText = (formData.get('loreText') as string) || null
  const lat = parseFloat(formData.get('lat') as string)
  const lng = parseFloat(formData.get('lng') as string)
  const radiusMeters = parseInt(formData.get('radiusMeters') as string, 10)
  const coinReward = parseInt(formData.get('coinReward') as string, 10)
  const xpCategory = formData.get('xpCategory') as string
  const coverImage = (formData.get('coverImage') as string) || null
  const beforeYouGo = parseBeforeYouGo(formData)

  await db.insert(chapters).values({
    id: createId(),
    arcId,
    order,
    title,
    loreText,
    lat,
    lng,
    radiusMeters,
    coinReward,
    xpCategory,
    coverImage,
    beforeYouGo,
  })

  revalidatePath(`/arcs/${arcId}`)
  redirect(`/arcs/${arcId}`)
}

export async function updateChapter(arcId: string, chapterId: string, formData: FormData) {
  const order = parseInt(formData.get('order') as string, 10)
  const title = formData.get('title') as string
  const loreText = (formData.get('loreText') as string) || null
  const lat = parseFloat(formData.get('lat') as string)
  const lng = parseFloat(formData.get('lng') as string)
  const radiusMeters = parseInt(formData.get('radiusMeters') as string, 10)
  const coinReward = parseInt(formData.get('coinReward') as string, 10)
  const xpCategory = formData.get('xpCategory') as string
  const coverImage = (formData.get('coverImage') as string) || null
  const beforeYouGo = parseBeforeYouGo(formData)

  await db.update(chapters).set({
    order, title, loreText, lat, lng, radiusMeters, coinReward, xpCategory, coverImage, beforeYouGo,
  }).where(eq(chapters.id, chapterId))

  revalidatePath(`/arcs/${arcId}`)
  redirect(`/arcs/${arcId}`)
}

export async function deleteChapter(arcId: string, chapterId: string) {
  await db.delete(chapters).where(eq(chapters.id, chapterId))
  revalidatePath(`/arcs/${arcId}`)
  redirect(`/arcs/${arcId}`)
}
