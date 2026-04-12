import { db } from '../db'
import { captures, captureLikes, chapters, arcs } from '../db/schema'
import { eq, and, desc, sql, inArray } from 'drizzle-orm'
import { user } from '../db/schema/auth'

export interface CommunityCapture {
  id: string
  photoUrl: string
  note: string | null
  capturedAt: Date
  likeCount: number
  likedByMe: boolean
  chapter: { id: string; title: string; order: number }
  arc: { id: string; title: string; worldType: string }
  user: { id: string; name: string | null }
}

// Shared select helper — builds the community capture shape
async function buildCommunityCaptures(
  captureRows: Array<typeof captures.$inferSelect>,
  currentUserId?: string,
): Promise<CommunityCapture[]> {
  if (captureRows.length === 0) return []

  const captureIds = captureRows.map((c) => c.id)
  const chapterIds = [...new Set(captureRows.map((c) => c.chapterId))]
  const userIds = [...new Set(captureRows.map((c) => c.userId))]

  // Like counts + whether current user liked each
  const likeCounts = await db
    .select({ captureId: captureLikes.captureId, count: sql<number>`count(*)::int` })
    .from(captureLikes)
    .where(inArray(captureLikes.captureId, captureIds))
    .groupBy(captureLikes.captureId)

  const likeCountMap = Object.fromEntries(likeCounts.map((l) => [l.captureId, l.count]))

  let myLikes = new Set<string>()
  if (currentUserId) {
    const myLikeRows = await db
      .select({ captureId: captureLikes.captureId })
      .from(captureLikes)
      .where(and(
        eq(captureLikes.userId, currentUserId),
        inArray(captureLikes.captureId, captureIds),
      ))
    myLikes = new Set(myLikeRows.map((l) => l.captureId))
  }

  // Chapter + arc info
  const chapterRows = await db
    .select({
      id: chapters.id,
      title: chapters.title,
      order: chapters.order,
      arcId: chapters.arcId,
    })
    .from(chapters)
    .where(inArray(chapters.id, chapterIds))

  const arcIds = [...new Set(chapterRows.map((c) => c.arcId))]
  const arcRows = await db
    .select({ id: arcs.id, title: arcs.title, worldType: arcs.worldType })
    .from(arcs)
    .where(inArray(arcs.id, arcIds))

  const chapterMap = Object.fromEntries(chapterRows.map((c) => [c.id, c]))
  const arcMap = Object.fromEntries(arcRows.map((a) => [a.id, a]))

  // User info
  const userRows = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(inArray(user.id, userIds))

  const userMap = Object.fromEntries(userRows.map((u) => [u.id, u]))

  return captureRows.map((c) => {
    const chapter = chapterMap[c.chapterId]
    const arc = arcMap[chapter?.arcId ?? '']
    return {
      id: c.id,
      photoUrl: c.photoUrl,
      note: c.note,
      capturedAt: c.capturedAt,
      likeCount: likeCountMap[c.id] ?? 0,
      likedByMe: myLikes.has(c.id),
      chapter: { id: chapter?.id ?? '', title: chapter?.title ?? '', order: chapter?.order ?? 0 },
      arc: { id: arc?.id ?? '', title: arc?.title ?? '', worldType: arc?.worldType ?? '' },
      user: { id: c.userId, name: userMap[c.userId]?.name ?? null },
    }
  })
}

// Chapter community feed — ranked by likes + recency, deduplicated per user
export async function getChapterCommunity(
  chapterId: string,
  currentUserId?: string,
  limit = 20,
) {
  const rows = await db
    .select()
    .from(captures)
    .where(and(eq(captures.chapterId, chapterId), eq(captures.isPublic, true)))
    .orderBy(desc(captures.capturedAt))
    .limit(limit * 2) // fetch extra, deduplicate by user below

  // One photo per user for variety
  const seen = new Set<string>()
  const deduped = rows.filter((r) => {
    if (seen.has(r.userId)) return false
    seen.add(r.userId)
    return true
  }).slice(0, limit)

  return buildCommunityCaptures(deduped, currentUserId)
}

// Arc community feed — recent public captures across all arc chapters
export async function getArcCommunity(
  arcId: string,
  currentUserId?: string,
  limit = 24,
) {
  const arcChapters = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(eq(chapters.arcId, arcId))

  if (arcChapters.length === 0) return []

  const chapterIds = arcChapters.map((c) => c.id)

  const rows = await db
    .select()
    .from(captures)
    .where(and(inArray(captures.chapterId, chapterIds), eq(captures.isPublic, true)))
    .orderBy(desc(captures.capturedAt))
    .limit(limit)

  return buildCommunityCaptures(rows, currentUserId)
}

// Global discovery feed — sorted by likes then recency
export async function getDiscoveryFeed(
  currentUserId?: string,
  worldType?: string,
  limit = 30,
  offset = 0,
) {
  let captureIds: string[]

  if (worldType) {
    // Filter by world type — join chapters → arcs
    const arcRows = await db
      .select({ id: arcs.id })
      .from(arcs)
      .where(eq(arcs.worldType, worldType as typeof arcs.$inferSelect['worldType']))

    if (arcRows.length === 0) return []

    const arcIds = arcRows.map((a) => a.id)
    const chapterRows = await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(inArray(chapters.arcId, arcIds))

    if (chapterRows.length === 0) return []

    const filteredChapterIds = chapterRows.map((c) => c.id)

    const rows = await db
      .select({ id: captures.id })
      .from(captures)
      .leftJoin(captureLikes, eq(captureLikes.captureId, captures.id))
      .where(and(inArray(captures.chapterId, filteredChapterIds), eq(captures.isPublic, true)))
      .groupBy(captures.id)
      .orderBy(desc(sql`count(${captureLikes.id})`), desc(captures.capturedAt))
      .limit(limit)
      .offset(offset)

    captureIds = rows.map((r) => r.id)
  } else {
    const rows = await db
      .select({ id: captures.id })
      .from(captures)
      .leftJoin(captureLikes, eq(captureLikes.captureId, captures.id))
      .where(eq(captures.isPublic, true))
      .groupBy(captures.id)
      .orderBy(desc(sql`count(${captureLikes.id})`), desc(captures.capturedAt))
      .limit(limit)
      .offset(offset)

    captureIds = rows.map((r) => r.id)
  }

  if (captureIds.length === 0) return []

  const captureRows = await db
    .select()
    .from(captures)
    .where(inArray(captures.id, captureIds))

  // Preserve order from ranked query
  const ordered = captureIds
    .map((id) => captureRows.find((c) => c.id === id))
    .filter(Boolean) as Array<typeof captures.$inferSelect>

  return buildCommunityCaptures(ordered, currentUserId)
}

// Like / unlike
export async function likeCapture(userId: string, captureId: string) {
  await db
    .insert(captureLikes)
    .values({ userId, captureId })
    .onConflictDoNothing()
}

export async function unlikeCapture(userId: string, captureId: string) {
  await db
    .delete(captureLikes)
    .where(and(eq(captureLikes.userId, userId), eq(captureLikes.captureId, captureId)))
}
