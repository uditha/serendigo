import { db } from '../db'
import { badges, userBadges, captures, userArcs, chapters } from '../db/schema'
import { eq, and, sql, count } from 'drizzle-orm'
import type { Badge } from '../db/schema/badges'

export interface BadgeAwarded {
  id: string
  name: string
  description: string
  icon: string
}

export async function checkAndAwardBadges(userId: string): Promise<BadgeAwarded[]> {
  // Load all badge definitions + already-earned badge IDs
  const [allBadges, earned] = await Promise.all([
    db.select().from(badges),
    db.select({ badgeId: userBadges.badgeId }).from(userBadges).where(eq(userBadges.userId, userId)),
  ])

  const earnedIds = new Set(earned.map((e) => e.badgeId))
  const unearnedBadges = allBadges.filter((b) => !earnedIds.has(b.id))

  if (unearnedBadges.length === 0) return []

  // Gather stats needed for condition checks (one query each)
  const [captureCountRow, arcCompleteCountRow, worldTypesRow, provincesRow] = await Promise.all([
    // Total capture count
    db.select({ count: count() }).from(captures).where(eq(captures.userId, userId)),

    // Completed arc count
    db.select({ count: count() }).from(userArcs)
      .where(and(eq(userArcs.userId, userId), sql`${userArcs.completedAt} IS NOT NULL`)),

    // Distinct world types captured
    db.execute(sql`
      SELECT COUNT(DISTINCT a.world_type) AS count
      FROM captures c
      JOIN chapters ch ON c.chapter_id = ch.id
      JOIN arcs a ON ch.arc_id = a.id
      WHERE c.user_id = ${userId}
    `),

    // Distinct provinces captured
    db.execute(sql`
      SELECT COUNT(DISTINCT a.province) AS count
      FROM captures c
      JOIN chapters ch ON c.chapter_id = ch.id
      JOIN arcs a ON ch.arc_id = a.id
      WHERE c.user_id = ${userId}
    `),
  ])

  const stats = {
    captureCount: captureCountRow[0]?.count ?? 0,
    arcCompleteCount: arcCompleteCountRow[0]?.count ?? 0,
    worldDiversity: parseInt((worldTypesRow as Array<{ count: string }>)[0]?.count ?? '0', 10),
    provinceCount: parseInt((provincesRow as Array<{ count: string }>)[0]?.count ?? '0', 10),
  }

  // Check each unearned badge
  const newlyEarned: Badge[] = []
  for (const badge of unearnedBadges) {
    if (conditionMet(badge, stats)) {
      newlyEarned.push(badge)
    }
  }

  if (newlyEarned.length === 0) return []

  // Award all newly earned badges
  await db.insert(userBadges).values(
    newlyEarned.map((b) => ({ userId, badgeId: b.id }))
  ).onConflictDoNothing()

  return newlyEarned.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
  }))
}

function conditionMet(
  badge: Badge,
  stats: { captureCount: number; arcCompleteCount: number; worldDiversity: number; provinceCount: number }
): boolean {
  const threshold = parseInt(badge.conditionValue, 10)

  switch (badge.conditionType) {
    case 'capture_count':      return stats.captureCount >= threshold
    case 'arc_complete_count': return stats.arcCompleteCount >= threshold
    case 'world_diversity':    return stats.worldDiversity >= threshold
    case 'province_count':     return stats.provinceCount >= threshold
    default: return false
  }
}

export async function getUserBadges(userId: string): Promise<(Badge & { earnedAt: Date })[]> {
  const rows = await db
    .select({
      id: badges.id,
      name: badges.name,
      description: badges.description,
      icon: badges.icon,
      conditionType: badges.conditionType,
      conditionValue: badges.conditionValue,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(userBadges.earnedAt)

  return rows
}
