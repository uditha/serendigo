import { db } from '../db'
import { user } from '../db/schema'
import { eq, sql } from 'drizzle-orm'

export interface StoryXP {
  taste: number
  wild: number
  move: number
  roots: number
  restore: number
  total: number
}

export interface ActiveArc {
  arcId: string
  title: string
  worldType: string
  totalChapters: number
  capturedChapters: number
  enrolledAt: string
  isComplete: boolean
}

export interface StoryStats {
  totalCaptures: number
  arcsEnrolled: number
  arcsCompleted: number
}

export interface StoryData {
  xp: StoryXP
  journeys: ActiveArc[]
  stats: StoryStats
}

export async function getUserStory(userId: string): Promise<StoryData> {
  const [userData] = await db
    .select({
      tasteXP: user.tasteXP,
      wildXP: user.wildXP,
      moveXP: user.moveXP,
      rootsXP: user.rootsXP,
      restoreXP: user.restoreXP,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  const xp: StoryXP = {
    taste: userData?.tasteXP ?? 0,
    wild: userData?.wildXP ?? 0,
    move: userData?.moveXP ?? 0,
    roots: userData?.rootsXP ?? 0,
    restore: userData?.restoreXP ?? 0,
    total:
      (userData?.tasteXP ?? 0) +
      (userData?.wildXP ?? 0) +
      (userData?.moveXP ?? 0) +
      (userData?.rootsXP ?? 0) +
      (userData?.restoreXP ?? 0),
  }

  const journeyRows = await db.execute(sql`
    SELECT
      a.id        AS arc_id,
      a.title,
      a.world_type,
      ua.enrolled_at,
      ua.completed_at,
      (SELECT COUNT(*) FROM chapters ch WHERE ch.arc_id = a.id) AS total_chapters,
      (
        SELECT COUNT(*) FROM captures c
        JOIN chapters ch ON c.chapter_id = ch.id
        WHERE c.user_id = ${userId} AND ch.arc_id = a.id
      ) AS captured_chapters
    FROM user_arcs ua
    JOIN arcs a ON ua.arc_id = a.id
    WHERE ua.user_id = ${userId}
    ORDER BY ua.enrolled_at DESC
  `) as Array<{
    arc_id: string
    title: string
    world_type: string
    enrolled_at: string
    completed_at: string | null
    total_chapters: string
    captured_chapters: string
  }>

  const journeys: ActiveArc[] = journeyRows.map((r) => ({
    arcId: r.arc_id,
    title: r.title,
    worldType: r.world_type,
    totalChapters: parseInt(r.total_chapters, 10),
    capturedChapters: parseInt(r.captured_chapters, 10),
    enrolledAt: r.enrolled_at,
    isComplete: r.completed_at !== null,
  }))

  const [statsRow] = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM captures WHERE user_id = ${userId}) AS total_captures,
      (SELECT COUNT(*) FROM user_arcs WHERE user_id = ${userId}) AS arcs_enrolled,
      (SELECT COUNT(*) FROM user_arcs WHERE user_id = ${userId} AND completed_at IS NOT NULL) AS arcs_completed
  `) as Array<{ total_captures: string; arcs_enrolled: string; arcs_completed: string }>

  const stats: StoryStats = {
    totalCaptures: parseInt(statsRow?.total_captures ?? '0', 10),
    arcsEnrolled: parseInt(statsRow?.arcs_enrolled ?? '0', 10),
    arcsCompleted: parseInt(statsRow?.arcs_completed ?? '0', 10),
  }

  return { xp, journeys, stats }
}
