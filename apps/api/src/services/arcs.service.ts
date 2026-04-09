import { db } from '../db'
import { arcs, chapters, userArcs, captures } from '../db/schema'
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

  const result = await db
    .select()
    .from(arcs)
    .where(and(...conditions))
    .orderBy(arcs.title)

  const currentMonth = new Date().getMonth() + 1

  return result.map((arc) => ({
    ...arc,
    isActiveNow: isInSeason(arc, currentMonth),
  }))
}

export async function getArcById(id: string) {
  const arc = await db.query.arcs.findFirst({
    where: eq(arcs.id, id),
    with: { chapters: { orderBy: (c, { asc }) => [asc(c.order)] } },
  })

  if (!arc) return null

  const currentMonth = new Date().getMonth() + 1
  return { ...arc, isActiveNow: isInSeason(arc, currentMonth) }
}

export async function getArcBySlug(slug: string) {
  const arc = await db.query.arcs.findFirst({
    where: eq(arcs.slug, slug),
    with: { chapters: { orderBy: (c, { asc }) => [asc(c.order)] } },
  })

  if (!arc) return null

  const currentMonth = new Date().getMonth() + 1
  return { ...arc, isActiveNow: isInSeason(arc, currentMonth) }
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
