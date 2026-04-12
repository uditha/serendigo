import type { Context } from 'hono'
import { getPartnerOffers, redeemCoins } from '../services/redemption.service'

export async function getOffers(c: Context) {
  try {
    const partnerId = c.req.param('partnerId') ?? ''
    const data = await getPartnerOffers(partnerId)
    if (!data) return c.json({ success: false, error: 'Partner not found' }, 404)
    return c.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ success: false, error: message }, 500)
  }
}

export async function postRedeem(c: Context) {
  try {
    const userId = c.get('userId') as string
    const body = await c.req.json()
    const offerId = body?.offerId as string | undefined
    if (!offerId) return c.json({ success: false, error: 'offerId required' }, 400)
    const result = await redeemCoins(userId, offerId)
    return c.json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const status = message?.includes('Not enough') ? 400 : 500
    return c.json({ success: false, error: message }, status)
  }
}
