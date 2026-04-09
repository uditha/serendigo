import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as handlers from '../handlers/capture.handler'

const capture = new Hono<{ Variables: { userId: string } }>()

capture.post('/', authMiddleware, handlers.createCapture)

export default capture
