import { db } from '../db'
import { places, userPlaces, arcPlaces, arcs, users } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { uploadPhoto } from '../utils/storage'
import { badgeQueue, arcProgressQueue } from '../jobs/queues'

interface NearbyFilters {
  category?: string
  worldType?: string
  radius?: number // km, default 5
}

export async function getNearbyPlaces(lat: number, lng: number, filters: NearbyFilters = {}) {
  const radiusMeters = (filters.radius ?? 5) * 1000

  const categoryFilter = filters.category
    ? sql`AND p.category = ${filters.category}`
    : sql``

  const worldTypeFilter = filters.worldType
    ? sql`AND p.world_type = ${filters.worldType}`
    : sql``

  return db.execute(sql`
    SELECT p.*,
      ROUND(ST_Distance(
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography
      ) / 1000, 2) AS distance_km
    FROM places p
    WHERE p.is_published = true
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography,
        ${radiusMeters}
      )
      ${categoryFilter}
      ${worldTypeFilter}
    ORDER BY distance_km
    LIMIT 20
  `)
}

export async function getPlaceById(id: string) {
  return db.query.places.findFirst({ where: eq(places.id, id) })
}

export async function getPlaceBySlug(slug: string) {
  return db.query.places.findFirst({ where: eq(places.slug, slug) })
}

export async function getArcsForPlace(placeId: string) {
  return db
    .select({
      arc: arcs,
      order: arcPlaces.order,
      totalPlaces: sql<number>`(
        SELECT COUNT(*) FROM arc_places WHERE arc_id = ${arcs.id}
      )`,
    })
    .from(arcPlaces)
    .innerJoin(arcs, eq(arcPlaces.arcId, arcs.id))
    .where(and(eq(arcPlaces.placeId, placeId), eq(arcs.isPublished, true)))
}

interface CaptureInput {
  userId: string
  placeId: string
  photo?: File
  lat: number
  lng: number
  note?: string | null
}

export async function capturePlace(input: CaptureInput) {
  // 1. Load place
  const place = await db.query.places.findFirst({
    where: eq(places.id, input.placeId),
  })

  if (!place) throw new Error('Place not found')
  if (!place.isPublished) throw new Error('Place not available')

  // 2. Verify GPS within 200m
  const withinRadius = await verifyLocation(input.lat, input.lng, place.lat, place.lng)
  if (!withinRadius) throw new Error('You are not close enough to this place')

  // 3. Prevent duplicate capture
  const existing = await db.query.userPlaces.findFirst({
    where: and(eq(userPlaces.userId, input.userId), eq(userPlaces.placeId, input.placeId)),
  })
  if (existing) throw new Error('You have already captured this place')

  // 4. Upload photo (optional in dev)
  const photoUrl = input.photo ? await uploadPhoto(input.photo, input.userId) : null

  // 5. Save capture
  const [capture] = await db
    .insert(userPlaces)
    .values({
      userId: input.userId,
      placeId: input.placeId,
      photoUrl,
      note: input.note ?? null,
      lat: input.lat,
      lng: input.lng,
      coinsEarned: place.coinReward,
    })
    .returning()

  // 6. Award coins + XP (CASE avoids sql.raw — safe dynamic column update)
  await db.execute(sql`
    UPDATE users SET
      serendipity_coins = serendipity_coins + ${place.coinReward},
      taste_xp   = taste_xp   + CASE WHEN ${place.xpCategory} = 'TASTE'   THEN ${place.coinReward} ELSE 0 END,
      wild_xp    = wild_xp    + CASE WHEN ${place.xpCategory} = 'WILD'    THEN ${place.coinReward} ELSE 0 END,
      move_xp    = move_xp    + CASE WHEN ${place.xpCategory} = 'MOVE'    THEN ${place.coinReward} ELSE 0 END,
      roots_xp   = roots_xp   + CASE WHEN ${place.xpCategory} = 'ROOTS'   THEN ${place.coinReward} ELSE 0 END,
      restore_xp = restore_xp + CASE WHEN ${place.xpCategory} = 'RESTORE' THEN ${place.coinReward} ELSE 0 END
    WHERE id = ${input.userId}
  `)

  // 7. Queue background jobs
  await Promise.all([
    badgeQueue.add('check-badges', { userId: input.userId }),
    arcProgressQueue.add('check', { userId: input.userId, placeId: input.placeId }),
  ])

  return {
    captureId: capture.id,
    coinsEarned: place.coinReward,
    xpEarned: place.coinReward,
    xpCategory: place.xpCategory,
    loreText: place.loreText,
  }
}

async function verifyLocation(
  userLat: number,
  userLng: number,
  placeLat: number,
  placeLng: number,
  radiusMeters = 200,
): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT ST_DWithin(
      ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
      ST_SetSRID(ST_MakePoint(${placeLng}, ${placeLat}), 4326)::geography,
      ${radiusMeters}
    ) AS within
  `)
  return (result as Array<{ within: boolean }>)[0]?.within === true
}
