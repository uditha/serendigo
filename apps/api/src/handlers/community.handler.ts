import type { Context } from 'hono'
import * as communityService from '../services/community.service'

export async function getChapterCommunity(c: Context) {
  const chapterId = c.req.param('chapterId')
  const userId = c.get('userId') as string | undefined
  const data = await communityService.getChapterCommunity(chapterId, userId)
  return c.json({ success: true, data })
}

export async function getArcCommunity(c: Context) {
  const arcId = c.req.param('arcId')
  const userId = c.get('userId') as string | undefined
  const data = await communityService.getArcCommunity(arcId, userId)
  return c.json({ success: true, data })
}

export async function getDiscoveryFeed(c: Context) {
  const userId = c.get('userId') as string | undefined
  const { worldType, limit, offset } = c.req.query()
  const data = await communityService.getDiscoveryFeed(
    userId,
    worldType || undefined,
    limit ? parseInt(limit) : 30,
    offset ? parseInt(offset) : 0,
  )
  return c.json({ success: true, data })
}

export async function likeCapture(c: Context) {
  const userId = c.get('userId')
  const captureId = c.req.param('captureId')
  await communityService.likeCapture(userId, captureId)
  return c.json({ success: true })
}

export async function unlikeCapture(c: Context) {
  const userId = c.get('userId')
  const captureId = c.req.param('captureId')
  await communityService.unlikeCapture(userId, captureId)
  return c.json({ success: true })
}
