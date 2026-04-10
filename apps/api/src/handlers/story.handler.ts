import type { Context } from 'hono'
import * as storyService from '../services/story.service'

export async function getStory(c: Context) {
  const userId = c.get('userId')
  const data = await storyService.getUserStory(userId)
  return c.json({ success: true, data })
}
