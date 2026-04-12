import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { auth } from '../lib/auth'
import * as handlers from '../handlers/partner.handler'

const partnerRoutes = new Hono<{ Variables: { userId: string } }>()

// Optional auth — sets userId if logged in, doesn't block
const optionalAuth = async (c: any, next: any) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (session?.user) c.set('userId', session.user.id)
  await next()
}

// Discovery
partnerRoutes.get('/nearby', handlers.getNearby)
partnerRoutes.get('/chapter/:chapterId', handlers.getChapterPartners)
partnerRoutes.get('/province/:province', handlers.getProvincePartners)
partnerRoutes.get('/flash-deals', optionalAuth, handlers.getFlashDeals)

// Detail
partnerRoutes.get('/:id', handlers.getPartnerById)

// Reviews (auth required)
partnerRoutes.post('/:id/reviews', authMiddleware, handlers.createReview)

// Analytics (fire-and-forget, no auth needed)
partnerRoutes.post('/:id/contact-click', handlers.logContactClick)

export default partnerRoutes
