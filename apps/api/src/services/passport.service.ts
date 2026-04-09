import { db } from '../db'
import { provinces, userArcs, arcs, userPlaces, places, arcPlaces } from '../db/schema'
import { eq, sql } from 'drizzle-orm'

export async function getUserPassport(userId: string) {
  const allProvinces = await db.select().from(provinces)

  const completedPerProvince = await db.execute(sql`
    SELECT a.province, COUNT(DISTINCT ua.arc_id) AS completed
    FROM user_arcs ua
    JOIN arcs a ON ua.arc_id = a.id
    WHERE ua.user_id = ${userId} AND ua.status = 'COMPLETED'
    GROUP BY a.province
  `) as Array<{ province: string; completed: string }>

  const totalPerProvince = await db.execute(sql`
    SELECT province, COUNT(*) AS total
    FROM arcs WHERE is_published = true
    GROUP BY province
  `) as Array<{ province: string; total: string }>

  const completedMap = Object.fromEntries(
    completedPerProvince.map((r) => [r.province, parseInt(r.completed, 10)]),
  )
  const totalMap = Object.fromEntries(
    totalPerProvince.map((r) => [r.province, parseInt(r.total, 10)]),
  )

  return allProvinces.map((p) => {
    const key = p.slug.toUpperCase().replace(/-/g, '_')
    const total = totalMap[key] ?? 0
    const completed = completedMap[key] ?? 0
    return {
      provinceId: p.id,
      provinceName: p.name,
      provinceSlug: p.slug,
      stampDesignKey: p.stampDesignKey,
      fillColor: p.fillColor,
      totalArcs: total,
      completedArcs: completed,
      isComplete: total > 0 && completed >= total,
    }
  })
}

export async function getCapturesByProvince(userId: string, provinceSlug: string) {
  const key = provinceSlug.toUpperCase().replace(/-/g, '_')
  return db.execute(sql`
    SELECT up.id, up.photo_url, up.note, up.captured_at, up.coins_earned,
           p.title AS place_title, p.category, p.world_type
    FROM user_places up
    JOIN places p ON up.place_id = p.id
    WHERE up.user_id = ${userId} AND p.province = ${key}
    ORDER BY up.captured_at DESC
  `)
}
