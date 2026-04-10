import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { getUserBadges } from '../services/badge.service'

const badges = new Hono<{ Variables: { userId: string } }>()

badges.get('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const data = await getUserBadges(userId)
    return c.json({ success: true, data })
  } catch (err) {
    console.error('getBadges error:', err)
    return c.json({ success: false, error: 'Failed to load badges' }, 500)
  }
})

export default badges
