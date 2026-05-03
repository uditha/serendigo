import { Hono } from 'hono'
import { db } from '../db'
import { user } from '../db/schema'
import { desc, sql } from 'drizzle-orm'

const leaderboard = new Hono()

leaderboard.get('/', async (c) => {
  try {
    const period = c.req.query('period') ?? 'all'

    let rows: { id: string; name: string | null; travellerCharacter: string | null; serendipityCoins: number; totalCaptures: number }[]

    if (period === 'week' || period === 'month') {
      const interval = period === 'week' ? '7 days' : '30 days'
      const result = await db.execute(sql`
        SELECT
          u.id,
          u.name,
          u.traveller_character AS "travellerCharacter",
          COALESCE(SUM(ch.coin_reward), 0)::int AS "serendipityCoins",
          COUNT(cap.id)::int AS "totalCaptures"
        FROM "user" u
        LEFT JOIN captures cap
          ON cap.user_id = u.id
          AND cap.captured_at >= NOW() - INTERVAL ${sql.raw(`'${interval}'`)}
        LEFT JOIN chapters ch ON ch.id = cap.chapter_id
        GROUP BY u.id, u.name, u.traveller_character
        HAVING COALESCE(SUM(ch.coin_reward), 0) > 0
        ORDER BY "serendipityCoins" DESC
        LIMIT 20
      `)
      rows = result.rows as typeof rows
    } else {
      rows = await db
        .select({
          id: user.id,
          name: user.name,
          travellerCharacter: user.travellerCharacter,
          serendipityCoins: user.serendipityCoins,
          totalCaptures: sql<number>`(SELECT COUNT(*) FROM captures WHERE user_id = ${user.id})`,
        })
        .from(user)
        .orderBy(desc(user.serendipityCoins))
        .limit(20) as typeof rows
    }

    const data = rows.map((row, i) => ({ rank: i + 1, ...row }))
    return c.json({ success: true, data })
  } catch (err) {
    console.error('leaderboard error:', err)
    return c.json({ success: false, error: 'Failed to load leaderboard' }, 500)
  }
})

export default leaderboard
