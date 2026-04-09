import { db } from '../db'
import { captures, chapters, users, userArcs } from '../db/schema'
import { eq, and, sql, count } from 'drizzle-orm'
import { uploadPhoto } from '../utils/storage'
import { badgeQueue, leaderboardQueue } from '../jobs'

interface CaptureInput {
  userId: string
  chapterId: string
  photo: File
  lat: number
  lng: number
  note?: string | null
}

export async function processCapture(input: CaptureInput) {
  // 1. Load chapter
  const chapter = await db.query.chapters.findFirst({
    where: eq(chapters.id, input.chapterId),
  })

  if (!chapter) throw new Error('Chapter not found')

  // 2. Verify GPS is within chapter radius (PostGIS)
  const withinRadius = await verifyLocation(
    input.lat,
    input.lng,
    chapter.lat,
    chapter.lng,
    chapter.radiusMeters,
  )

  if (!withinRadius) {
    throw new Error('You are not close enough to this location')
  }

  // 3. Check not already captured
  const existing = await db.query.captures.findFirst({
    where: and(eq(captures.userId, input.userId), eq(captures.chapterId, input.chapterId)),
  })

  if (existing) throw new Error('You have already captured this chapter')

  // 4. Upload photo to Cloudflare R2
  const photoUrl = await uploadPhoto(input.photo, input.userId)

  // 5. Save capture
  const [capture] = await db
    .insert(captures)
    .values({
      userId: input.userId,
      chapterId: input.chapterId,
      photoUrl,
      note: input.note ?? null,
      lat: input.lat,
      lng: input.lng,
      coinsEarned: chapter.coinReward,
    })
    .returning()

  // 6. Award coins + XP atomically
  const xpField = xpColumnForCategory(chapter.xpCategory)

  await db
    .update(users)
    .set({
      serendipityCoins: sql`serendipity_coins + ${chapter.coinReward}`,
      [xpField]: sql`${sql.raw(xpField)} + ${chapter.coinReward}`,
    })
    .where(eq(users.id, input.userId))

  // 7. Check arc completion
  const arcComplete = await checkArcCompletion(input.userId, chapter.arcId)

  // 8. Queue background jobs
  await Promise.all([
    badgeQueue.add('check-badges', { userId: input.userId }),
    leaderboardQueue.add('update', { userId: input.userId, coins: chapter.coinReward }),
  ])

  return {
    captureId: capture.id,
    coinsEarned: chapter.coinReward,
    xpEarned: chapter.coinReward,
    xpCategory: chapter.xpCategory,
    loreText: chapter.loreText,
    arcComplete,
  }
}

async function verifyLocation(
  userLat: number,
  userLng: number,
  chapterLat: number,
  chapterLng: number,
  radiusMeters: number,
): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT ST_DWithin(
      ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
      ST_SetSRID(ST_MakePoint(${chapterLng}, ${chapterLat}), 4326)::geography,
      ${radiusMeters}
    ) AS within
  `)

  return (result as Array<{ within: boolean }>)[0]?.within === true
}

async function checkArcCompletion(userId: string, arcId: string): Promise<boolean> {
  const [totalRow] = await db
    .select({ count: count() })
    .from(chapters)
    .where(eq(chapters.arcId, arcId))

  const [capturedRow] = await db.execute(sql`
    SELECT COUNT(*) AS count
    FROM captures c
    JOIN chapters ch ON c.chapter_id = ch.id
    WHERE c.user_id = ${userId} AND ch.arc_id = ${arcId}
  `) as Array<{ count: string }>

  const total = totalRow?.count ?? 0
  const captured = parseInt(capturedRow?.count ?? '0', 10)

  if (total > 0 && captured >= total) {
    await db
      .update(userArcs)
      .set({ completedAt: new Date() })
      .where(and(eq(userArcs.userId, userId), eq(userArcs.arcId, arcId)))

    return true
  }

  return false
}

function xpColumnForCategory(category: string): string {
  const map: Record<string, string> = {
    TASTE: 'taste_xp',
    WILD: 'wild_xp',
    MOVE: 'move_xp',
    ROOTS: 'roots_xp',
    RESTORE: 'restore_xp',
  }
  return map[category] ?? 'taste_xp'
}
