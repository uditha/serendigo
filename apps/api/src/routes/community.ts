import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { auth } from '../lib/auth'
import * as handlers from '../handlers/community.handler'

const community = new Hono<{ Variables: { userId: string } }>()

// Optional auth middleware — sets userId if logged in, but doesn't block
const optionalAuth = async (c: any, next: any) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (session?.user) c.set('userId', session.user.id)
  await next()
}

// Public feeds (userId optional for likedByMe)
community.get('/feed', optionalAuth, handlers.getDiscoveryFeed)
community.get('/chapter/:chapterId', optionalAuth, handlers.getChapterCommunity)
community.get('/arc/:arcId', optionalAuth, handlers.getArcCommunity)

// Likes require auth
community.post('/captures/:captureId/like', authMiddleware, handlers.likeCapture)
community.delete('/captures/:captureId/like', authMiddleware, handlers.unlikeCapture)

export default community
