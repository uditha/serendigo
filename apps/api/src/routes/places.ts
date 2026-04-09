import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as handlers from '../handlers/places.handler'

const places = new Hono<{ Variables: { userId: string } }>()

places.get('/nearby', handlers.getNearby)
places.get('/slug/:slug', handlers.getPlaceBySlug)
places.get('/:id', handlers.getPlaceById)
places.get('/:id/arcs', handlers.getArcsForPlace)
places.post('/:id/capture', authMiddleware, handlers.capturePlace)

export default places
