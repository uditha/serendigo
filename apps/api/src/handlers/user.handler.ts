import { Context } from 'hono'
import { db } from '../db'
import { user } from '../db/schema/auth'
import { eq } from 'drizzle-orm'

const VALID_CHARACTERS = ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE']

export async function updateCharacter(c: Context) {
  try {
    const userId = c.get('userId')
    const { character } = await c.req.json()

    if (!character || !VALID_CHARACTERS.includes(character)) {
      return c.json({ success: false, error: 'Invalid character type' }, 400)
    }

    const [updated] = await db
      .update(user)
      .set({ travellerCharacter: character })
      .where(eq(user.id, userId))
      .returning({ id: user.id, travellerCharacter: user.travellerCharacter })

    return c.json({ success: true, data: updated })
  } catch (error) {
    console.error('updateCharacter error:', error)
    return c.json({ success: false, error: 'Failed to update character' }, 500)
  }
}

export async function getMe(c: Context) {
  try {
    const userId = c.get('userId')

    const [me] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        travellerCharacter: user.travellerCharacter,
        serendipityCoins: user.serendipityCoins,
        level: user.level,
        tasteXP: user.tasteXP,
        wildXP: user.wildXP,
        moveXP: user.moveXP,
        rootsXP: user.rootsXP,
        restoreXP: user.restoreXP,
      })
      .from(user)
      .where(eq(user.id, userId))

    if (!me) return c.json({ success: false, error: 'User not found' }, 404)

    return c.json({ success: true, data: me })
  } catch (error) {
    console.error('getMe error:', error)
    return c.json({ success: false, error: 'Failed to fetch user' }, 500)
  }
}
