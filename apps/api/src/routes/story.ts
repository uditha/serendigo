import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as handlers from '../handlers/story.handler'

const storyRouter = new Hono<{ Variables: { userId: string } }>()

storyRouter.get('/', authMiddleware, handlers.getStory)

export default storyRouter
