import { createMiddleware } from 'hono/factory'
import { and, eq, gt } from 'drizzle-orm'
import { auth } from '../lib/auth'
import { db } from '../db'
import { session as sessionTable } from '../db/schema'

export const authMiddleware = createMiddleware<{
  Variables: { userId: string }
}>(async (c, next) => {
  // First try Better Auth's own session validation (email/password sessions)
  const baSession = await auth.api.getSession({ headers: c.req.raw.headers })

  if (baSession?.user) {
    c.set('userId', baSession.user.id)
    await next()
    return
  }

  // Fallback: look up the raw token directly in the session table.
  // This handles sessions created by our Google mobile endpoint.
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    const [row] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(and(eq(sessionTable.token, token), gt(sessionTable.expiresAt, new Date())))

    if (row) {
      c.set('userId', row.userId)
      await next()
      return
    }
  }

  return c.json({ success: false, error: 'Unauthorized' }, 401)
})
