'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { creators, arcSubmissions, arcs, chapters } from '@/db/schema'
import { createId } from '@paralleldrive/cuid2'
import type { ChapterDraft } from '../types/creator'
import {
  sendCreatorApprovedEmail,
  sendCreatorRejectedEmail,
  sendSubmissionPublishedEmail,
  sendSubmissionRejectedEmail,
} from '@/lib/email'

// ─── Creator application review ───────────────────────────────────────────
export async function approveCreator(id: string) {
  const rows = await db.select().from(creators).where(eq(creators.id, id)).limit(1)
  const creator = rows[0]
  await db.update(creators).set({
    status: 'approved',
    approvedAt: new Date(),
    rejectionReason: null,
  }).where(eq(creators.id, id))
  if (creator) {
    await sendCreatorApprovedEmail(creator.email, creator.name).catch(e => console.error('[email] send failed:', e))
  }
  revalidatePath('/creators')
}

export async function rejectCreator(formData: FormData) {
  const id = String(formData.get('id'))
  const reason = String(formData.get('reason') ?? '').trim()
  const rows = await db.select().from(creators).where(eq(creators.id, id)).limit(1)
  const creator = rows[0]
  await db.update(creators).set({
    status: 'rejected',
    rejectionReason: reason || null,
  }).where(eq(creators.id, id))
  if (creator) {
    await sendCreatorRejectedEmail(creator.email, creator.name, reason || null).catch(e => console.error('[email] send failed:', e))
  }
  revalidatePath('/creators')
}

export async function suspendCreator(id: string) {
  await db.update(creators).set({ status: 'suspended' }).where(eq(creators.id, id))
  revalidatePath('/creators')
}

// ─── Submission review ────────────────────────────────────────────────────
export async function approveSubmission(formData: FormData) {
  const id = String(formData.get('id'))
  const rows = await db.select().from(arcSubmissions).where(eq(arcSubmissions.id, id)).limit(1)
  const sub = rows[0]
  if (!sub) return

  const subChapters = (sub.chapters as ChapterDraft[]) ?? []

  // slugify title
  const slug = sub.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
    + '-' + createId().slice(0, 6)

  // create the live arc
  const arcId = createId()
  await db.insert(arcs).values({
    id: arcId,
    title: sub.title,
    slug,
    worldType: sub.worldType,
    province: sub.province,
    narratorName: null,
    introText: sub.narrativeHook ?? null,
    coverImage: sub.coverImage ?? null,
    isPublished: true,
    creatorId: sub.creatorId,
  })

  // create chapters
  for (let i = 0; i < subChapters.length; i++) {
    const ch = subChapters[i]
    await db.insert(chapters).values({
      id: createId(),
      arcId,
      order: i + 1,
      title: ch.title,
      loreText: ch.lore ?? null,
      lat: ch.lat,
      lng: ch.lng,
      radiusMeters: 200,
      coinReward: ch.coinReward ?? 50,
      xpCategory: ch.xpCategory ?? sub.worldType.toLowerCase(),
      coverImage: ch.coverImage ?? null,
    })
  }

  // mark submission
  await db.update(arcSubmissions).set({
    status: 'published',
    publishedArcId: arcId,
    reviewedAt: new Date(),
    adminFeedback: null,
  }).where(eq(arcSubmissions.id, id))

  // email the creator
  const creatorRows = await db.select().from(creators).where(eq(creators.id, sub.creatorId)).limit(1)
  const creator = creatorRows[0]
  if (creator) {
    await sendSubmissionPublishedEmail(creator.email, creator.name, sub.title).catch(e => console.error('[email] send failed:', e))
  }

  revalidatePath('/submissions')
  revalidatePath('/arcs')
}

export async function rejectSubmission(formData: FormData) {
  const id = String(formData.get('id'))
  const feedback = String(formData.get('feedback') ?? '').trim()
  const rows = await db.select().from(arcSubmissions).where(eq(arcSubmissions.id, id)).limit(1)
  const sub = rows[0]
  await db.update(arcSubmissions).set({
    status: 'rejected',
    adminFeedback: feedback || null,
    reviewedAt: new Date(),
  }).where(eq(arcSubmissions.id, id))
  if (sub) {
    const creatorRows = await db.select().from(creators).where(eq(creators.id, sub.creatorId)).limit(1)
    const creator = creatorRows[0]
    if (creator) {
      await sendSubmissionRejectedEmail(creator.email, creator.name, sub.title, feedback || null).catch(e => console.error('[email] send failed:', e))
    }
  }
  revalidatePath('/submissions')
}

export async function markSubmissionInReview(id: string) {
  await db.update(arcSubmissions).set({
    status: 'submitted',
  }).where(eq(arcSubmissions.id, id))
  revalidatePath('/submissions')
}
