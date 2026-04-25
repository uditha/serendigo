import { db } from '../db'
import { arcs, chapters, userArcs, captures, creators } from '../db/schema'
import { eq, and, inArray } from 'drizzle-orm'

interface ArcFilters {
  province?: string
  worldType?: string
}

export async function getArcs(filters: ArcFilters) {
  const conditions = [eq(arcs.isPublished, true)]

  if (filters.province) {
    conditions.push(eq(arcs.province, filters.province as Arc['province']))
  }
  if (filters.worldType) {
    conditions.push(eq(arcs.worldType, filters.worldType as Arc['worldType']))
  }

  const result = await db.query.arcs.findMany({
    where: and(...conditions),
    orderBy: (a, { asc }) => [asc(a.title)],
    with: {
      chapters: {
        columns: { id: true, lat: true, lng: true, title: true, order: true },
        orderBy: (c, { asc }) => [asc(c.order)],
      },
    },
  })

  const currentMonth = new Date().getMonth() + 1

  return result.map((arc) => ({
    ...arc,
    isActiveNow: isInSeason(arc, currentMonth),
  }))
}

async function attachCreator(arc: { creatorId?: string | null }) {
  if (!arc.creatorId) return null
  const rows = await db
    .select({ id: creators.id, name: creators.name, bio: creators.bio, photo: creators.photo, instagram: creators.instagram, website: creators.website, slug: creators.slug })
    .from(creators)
    .where(eq(creators.id, arc.creatorId))
    .limit(1)
  return rows[0] ?? null
}

export async function getArcById(id: string) {
  const arc = await db.query.arcs.findFirst({
    where: eq(arcs.id, id),
    with: { chapters: { orderBy: (c, { asc }) => [asc(c.order)] } },
  })

  if (!arc) return null

  const currentMonth = new Date().getMonth() + 1
  const creator = await attachCreator(arc)
  return { ...arc, isActiveNow: isInSeason(arc, currentMonth), creator }
}

export async function getArcBySlug(slug: string) {
  const arc = await db.query.arcs.findFirst({
    where: eq(arcs.slug, slug),
    with: { chapters: { orderBy: (c, { asc }) => [asc(c.order)] } },
  })

  if (!arc) return null

  const currentMonth = new Date().getMonth() + 1
  const creator = await attachCreator(arc)
  return { ...arc, isActiveNow: isInSeason(arc, currentMonth), creator }
}

export async function getChapters(arcId: string) {
  return db
    .select()
    .from(chapters)
    .where(eq(chapters.arcId, arcId))
    .orderBy(chapters.order)
}

export async function enrollUser(userId: string, arcId: string) {
  const existing = await db.query.userArcs.findFirst({
    where: and(eq(userArcs.userId, userId), eq(userArcs.arcId, arcId)),
  })

  if (existing) return existing

  const [enrollment] = await db
    .insert(userArcs)
    .values({ userId, arcId })
    .returning()

  return enrollment
}

export async function getUserArcProgress(userId: string, arcId: string) {
  const enrollment = await db.query.userArcs.findFirst({
    where: and(eq(userArcs.userId, userId), eq(userArcs.arcId, arcId)),
  })

  if (!enrollment) return null

  const arcChapters = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(eq(chapters.arcId, arcId))

  const chapterIds = arcChapters.map((c) => c.id)

  const completedCaptures = await db
    .select({ chapterId: captures.chapterId })
    .from(captures)
    .where(and(eq(captures.userId, userId), inArray(captures.chapterId, chapterIds)))

  const completedIds = completedCaptures.map((c) => c.chapterId)

  return {
    ...enrollment,
    totalChapters: chapterIds.length,
    completedChapters: completedIds.length,
    completedChapterIds: completedIds,
    isComplete: enrollment.completedAt !== null,
  }
}

export async function getMyArcCaptures(userId: string, arcId: string) {
  const arc = await db.query.arcs.findFirst({
    where: eq(arcs.id, arcId),
    columns: { id: true, title: true, worldType: true },
  })
  if (!arc) return null

  const allChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.arcId, arcId))
    .orderBy(chapters.order)

  const userCaptures = await db
    .select()
    .from(captures)
    .where(
      and(
        eq(captures.userId, userId),
        inArray(captures.chapterId, allChapters.map((c) => c.id)),
      ),
    )

  const capturesByChapter = Object.fromEntries(
    userCaptures.map((c) => [c.chapterId, c]),
  )

  return {
    arc,
    chapters: allChapters.map((ch) => {
      const capture = capturesByChapter[ch.id] ?? null
      return {
        id: ch.id,
        order: ch.order,
        title: ch.title,
        coinReward: ch.coinReward,
        capture: capture
          ? {
              id: capture.id,
              photoUrl: capture.photoUrl,
              note: capture.note,
              coinsEarned: capture.coinsEarned,
              capturedAt: capture.capturedAt,
            }
          : null,
      }
    }),
  }
}

// Types imported from schema
import type { Arc } from '../db/schema'

function isInSeason(arc: Arc, month: number): boolean {
  if (!arc.isSeasonal || arc.seasonStart === null || arc.seasonEnd === null) return true
  if (arc.seasonStart <= arc.seasonEnd) {
    return month >= arc.seasonStart && month <= arc.seasonEnd
  }
  // Wraps across year-end (e.g. Nov–Mar)
  return month >= arc.seasonStart || month <= arc.seasonEnd
}
