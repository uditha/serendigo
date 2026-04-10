import { Hono } from 'hono'
import { db } from '../db'
import { user } from '../db/schema'
import { desc, sql } from 'drizzle-orm'

const leaderboard = new Hono()

leaderboard.get('/', async (c) => {
  try {
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        travellerCharacter: user.travellerCharacter,
        serendipityCoins: user.serendipityCoins,
        totalCaptures: sql<number>`(
          SELECT COUNT(*) FROM captures WHERE user_id = ${user.id}
        )`,
      })
      .from(user)
      .orderBy(desc(user.serendipityCoins))
      .limit(20)

    const data = rows.map((row, i) => ({ rank: i + 1, ...row }))

    return c.json({ success: true, data })
  } catch (err) {
    console.error('leaderboard error:', err)
    return c.json({ success: false, error: 'Failed to load leaderboard' }, 500)
  }
})

export default leaderboard
