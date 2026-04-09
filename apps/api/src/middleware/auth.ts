import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/auth'

export const authMiddleware = createMiddleware<{
  Variables: { userId: string }
}>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session?.user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  c.set('userId', session.user.id)
  await next()
})
