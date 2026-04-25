import { Hono } from 'hono'
import { randomBytes } from 'crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { user, session, account } from '../db/schema'

const router = new Hono()

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture: string
  verified_email: boolean
}

router.post('/', async (c) => {
  const body = await c.req.json<{ accessToken: string }>()
  const { accessToken } = body

  if (!accessToken) {
    return c.json({ success: false, error: 'Access token required' }, 400)
  }

  // Verify access token with Google
  const googleRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!googleRes.ok) {
    return c.json({ success: false, error: 'Invalid Google token' }, 401)
  }

  const googleUser = (await googleRes.json()) as GoogleUserInfo
  const now = new Date()

  // Find or create user by email
  const [found] = await db.select().from(user).where(eq(user.email, googleUser.email))

  type UserRow = typeof found

  let resolvedUser: NonNullable<UserRow>

  if (!found) {
    const [newUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name: googleUser.name,
        email: googleUser.email,
        emailVerified: googleUser.verified_email ?? true,
        image: googleUser.picture,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
    resolvedUser = newUser!
  } else if (googleUser.picture && !found.image) {
    // Backfill profile pic on first Google login for existing email/password users
    const [updated] = await db
      .update(user)
      .set({ image: googleUser.picture, updatedAt: now })
      .where(eq(user.id, found.id))
      .returning()
    resolvedUser = updated!
  } else {
    resolvedUser = found
  }

  // Upsert Google account record
  const [existingAccount] = await db
    .select()
    .from(account)
    .where(and(eq(account.providerId, 'google'), eq(account.accountId, googleUser.id)))

  if (!existingAccount) {
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: googleUser.id,
      providerId: 'google',
      userId: resolvedUser.id,
      accessToken,
      createdAt: now,
      updatedAt: now,
    })
  } else {
    await db
      .update(account)
      .set({ accessToken, updatedAt: now })
      .where(eq(account.id, existingAccount.id))
  }

  // Create session (same format Better Auth uses)
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await db.insert(session).values({
    id: crypto.randomUUID(),
    token,
    userId: resolvedUser.id,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  })

  return c.json({
    success: true,
    token,
    user: {
      id: resolvedUser.id,
      name: resolvedUser.name,
      email: resolvedUser.email,
      image: resolvedUser.image,
      serendipityCoins: resolvedUser.serendipityCoins ?? 0,
      level: resolvedUser.level ?? 1,
      travellerCharacter: resolvedUser.travellerCharacter,
    },
  })
})

export default router
