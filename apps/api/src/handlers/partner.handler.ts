import type { Context } from 'hono'
import * as partnerService from '../services/partner.service'
import type { PartnerCategory } from '../db/schema/partners'
import { db } from '../db'
import { user } from '../db/schema/auth'
import { eq } from 'drizzle-orm'

export async function getNearby(c: Context) {
  const { lat, lng, category } = c.req.query()
  if (!lat || !lng) return c.json({ success: false, error: 'lat and lng required' }, 400)

  const data = await partnerService.getNearbyPartners(
    parseFloat(lat),
    parseFloat(lng),
    category as PartnerCategory | undefined,
  )
  return c.json({ success: true, data })
}

export async function getChapterPartners(c: Context) {
  const { lat, lng } = c.req.query()
  const chapterId = c.req.param('chapterId') ?? ''
  if (!lat || !lng) return c.json({ success: false, error: 'lat and lng required' }, 400)

  const data = await partnerService.getChapterPartners(
    chapterId,
    parseFloat(lat),
    parseFloat(lng),
  )
  return c.json({ success: true, data })
}

export async function getProvincePartners(c: Context) {
  const province = c.req.param('province') ?? ''
  const { category } = c.req.query()

  const data = await partnerService.getProvincePartners(
    province,
    category as PartnerCategory | undefined,
  )
  return c.json({ success: true, data })
}

export async function getPartnerById(c: Context) {
  const id = c.req.param('id') ?? ''
  const data = await partnerService.getPartnerById(id)
  if (!data) return c.json({ success: false, error: 'Partner not found' }, 404)
  return c.json({ success: true, data })
}

export async function getFlashDeals(c: Context) {
  const { lat, lng } = c.req.query()
  if (!lat || !lng) return c.json({ success: false, error: 'lat and lng required' }, 400)

  const userId = c.get('userId') as string | undefined
  let coins = 0

  if (userId) {
    const [userData] = await db
      .select({ serendipityCoins: user.serendipityCoins })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
    coins = userData?.serendipityCoins ?? 0
  }

  const data = await partnerService.getActiveFlashDeals(
    parseFloat(lat),
    parseFloat(lng),
    coins,
  )
  return c.json({ success: true, data })
}

export async function createReview(c: Context) {
  const userId = c.get('userId') as string
  const partnerId = c.req.param('id') ?? ''
  const { rating, body } = await c.req.json()

  if (!rating || rating < 1 || rating > 5) {
    return c.json({ success: false, error: 'Rating must be 1–5' }, 400)
  }

  const result = await partnerService.createReview(userId, partnerId, rating, body ?? null)
  return c.json({ success: true, data: result })
}

export async function logContactClick(c: Context) {
  const partnerId = c.req.param('id') ?? ''
  await partnerService.logContactClick(partnerId)
  return c.json({ success: true })
}
