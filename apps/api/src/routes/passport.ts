import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as handlers from '../handlers/passport.handler'

const passport = new Hono<{ Variables: { userId: string } }>()

passport.get('/', authMiddleware, handlers.getPassport)
passport.get('/:province/captures', authMiddleware, handlers.getProvinceCaptures)

export default passport
