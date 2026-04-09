import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as handlers from '../handlers/user.handler'

const userRouter = new Hono<{ Variables: { userId: string } }>()

userRouter.patch('/character', authMiddleware, handlers.updateCharacter)
userRouter.get('/me', authMiddleware, handlers.getMe)

export default userRouter
