import { db } from '../db'
import { arcs, arcPlaces, places, userArcs, userPlaces } from '../db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import type { Arc } from '../db/schema'

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
  return result.map((arc) => ({ ...arc, isActiveNow: isInSeason(arc, currentMonth) }))
}

export async function getArcById(id: string) {
  const arc = await db.query.arcs.findFirst({ where: eq(arcs.id, id) })
  if (!arc) return null

  const arcWithPlaces = await getArcPlaces(id)
  const currentMonth = new Date().getMonth() + 1
  return { ...arc, places: arcWithPlaces, isActiveNow: isInSeason(arc, currentMonth) }
}

export async function getArcBySlug(slug: string) {
  const arc = await db.query.arcs.findFirst({ where: eq(arcs.slug, slug) })
  if (!arc) return null

  const arcWithPlaces = await getArcPlaces(arc.id)
  const currentMonth = new Date().getMonth() + 1
  return { ...arc, places: arcWithPlaces, isActiveNow: isInSeason(arc, currentMonth) }
}

async function getArcPlaces(arcId: string) {
  return db
    .select({
      place: places,
      order: arcPlaces.order,
      transitionText: arcPlaces.transitionText,
      customLoreText: arcPlaces.customLoreText,
    })
    .from(arcPlaces)
    .innerJoin(places, eq(arcPlaces.placeId, places.id))
    .where(eq(arcPlaces.arcId, arcId))
    .orderBy(arcPlaces.order)
}

export async function getUserArcProgress(userId: string, arcId: string) {
  const enrollment = await db.query.userArcs.findFirst({
    where: and(eq(userArcs.userId, userId), eq(userArcs.arcId, arcId)),
  })

  const arcWithPlaces = await getArcPlaces(arcId)
  const placeIds = arcWithPlaces.map((ap) => ap.place.id)

  const captured = placeIds.length > 0
    ? await db
        .select({ placeId: userPlaces.placeId })
        .from(userPlaces)
        .where(and(eq(userPlaces.userId, userId), inArray(userPlaces.placeId, placeIds)))
    : []

  const capturedIds = captured.map((c) => c.placeId)

  return {
    enrollment: enrollment ?? null,
    totalPlaces: placeIds.length,
    completedPlaces: capturedIds.length,
    capturedPlaceIds: capturedIds,
    isComplete: enrollment?.status === 'COMPLETED',
  }
}

function isInSeason(arc: Arc, month: number): boolean {
  if (!arc.isSeasonal || arc.seasonStart === null || arc.seasonEnd === null) return true
  if (arc.seasonStart <= arc.seasonEnd) {
    return month >= arc.seasonStart && month <= arc.seasonEnd
  }
  return month >= arc.seasonStart || month <= arc.seasonEnd
}
