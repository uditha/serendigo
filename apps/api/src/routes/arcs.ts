import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as handlers from '../handlers/arcs.handler'

const arcs = new Hono<{ Variables: { userId: string } }>()

arcs.get('/', handlers.getArcs)
arcs.get('/slug/:slug', handlers.getArcBySlug)
arcs.get('/:id', handlers.getArcById)
arcs.get('/:id/progress', authMiddleware, handlers.getArcProgress)

export default arcs
