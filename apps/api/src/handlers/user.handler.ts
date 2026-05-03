import { Context } from 'hono'
import { db } from '../db'
import { user, session, account } from '../db/schema/auth'
import { captures } from '../db/schema/captures'
import { captureLikes } from '../db/schema/capture_likes'
import { userArcs } from '../db/schema/user_arcs'
import { userBadges } from '../db/schema/badges'
import { coinRedemptions, partnerReviews } from '../db/schema/partners'
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

export async function updatePushToken(c: Context) {
  try {
    const userId = c.get('userId')
    const { token } = await c.req.json()

    if (!token || typeof token !== 'string') {
      return c.json({ success: false, error: 'Invalid token' }, 400)
    }

    await db
      .update(user)
      .set({ pushToken: token })
      .where(eq(user.id, userId))

    return c.json({ success: true })
  } catch (error) {
    console.error('updatePushToken error:', error)
    return c.json({ success: false, error: 'Failed to save push token' }, 500)
  }
}

export async function deleteAccount(c: Context) {
  try {
    const userId = c.get('userId')

    // Delete in FK-safe order: dependants first, then auth rows, then user
    await db.delete(captureLikes).where(eq(captureLikes.userId, userId))
    await db.delete(coinRedemptions).where(eq(coinRedemptions.userId, userId))
    await db.delete(partnerReviews).where(eq(partnerReviews.userId, userId))
    await db.delete(captures).where(eq(captures.userId, userId))
    await db.delete(userBadges).where(eq(userBadges.userId, userId))
    await db.delete(userArcs).where(eq(userArcs.userId, userId))
    await db.delete(session).where(eq(session.userId, userId))
    await db.delete(account).where(eq(account.userId, userId))
    await db.delete(user).where(eq(user.id, userId))

    return c.json({ success: true })
  } catch (error) {
    console.error('deleteAccount error:', error)
    return c.json({ success: false, error: 'Failed to delete account' }, 500)
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
        image: user.image,
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
