import { db } from '../db'
import { captures, chapters, arcs, districts, userArcs } from '../db/schema'
import { eq, sql } from 'drizzle-orm'

export interface ProvinceStamp {
  provinceId: string
  provinceName: string
  provinceSlug: string
  stampDesignKey: string | null
  fillColor: string | null
  totalArcs: number
  completedArcs: number
  isComplete: boolean
}

function toDisplayName(slug: string): string {
  return slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function getUserPassport(userId: string): Promise<ProvinceStamp[]> {
  // Derive the 9 provinces from the districts table (already seeded)
  const provinceRows = await db.execute(sql`
    SELECT DISTINCT province FROM districts ORDER BY province
  `) as Array<{ province: string }>

  const completedArcsPerProvince = await db.execute(sql`
    SELECT a.province, COUNT(DISTINCT ua.arc_id) AS completed
    FROM user_arcs ua
    JOIN arcs a ON ua.arc_id = a.id
    WHERE ua.user_id = ${userId} AND ua.completed_at IS NOT NULL
    GROUP BY a.province
  `) as Array<{ province: string; completed: string }>

  const totalArcsPerProvince = await db.execute(sql`
    SELECT province, COUNT(*) AS total
    FROM arcs
    WHERE is_published = true
    GROUP BY province
  `) as Array<{ province: string; total: string }>

  const completedMap = Object.fromEntries(
    completedArcsPerProvince.map((r) => [r.province, parseInt(r.completed, 10)]),
  )

  const totalMap = Object.fromEntries(
    totalArcsPerProvince.map((r) => [r.province, parseInt(r.total, 10)]),
  )

  return provinceRows.map((row) => {
    // district.province is e.g. "north_western"
    // arcs.province enum is e.g. "NORTH_WESTERN"
    const arcKey = row.province.toUpperCase()
    const total = totalMap[arcKey] ?? 0
    const completed = completedMap[arcKey] ?? 0

    return {
      provinceId: row.province,
      provinceName: toDisplayName(row.province),
      provinceSlug: row.province,
      stampDesignKey: null,
      fillColor: null,
      totalArcs: total,
      completedArcs: completed,
      isComplete: total > 0 && completed >= total,
    }
  })
}

export async function getCapturesByProvince(userId: string, provinceSlug: string) {
  return db.execute(sql`
    SELECT c.id, c.photo_url, c.note, c.captured_at, c.coins_earned,
           ch.title AS chapter_title, a.title AS arc_title
    FROM captures c
    JOIN chapters ch ON c.chapter_id = ch.id
    JOIN arcs a ON ch.arc_id = a.id
    WHERE c.user_id = ${userId}
      AND a.province = ${provinceSlug.toUpperCase().replace(/-/g, '_')}
    ORDER BY c.captured_at DESC
  `)
}
