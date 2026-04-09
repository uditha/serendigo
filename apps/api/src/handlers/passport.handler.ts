import type { Context } from 'hono'
import * as passportService from '../services/passport.service'

export async function getPassport(c: Context) {
  const userId = c.get('userId')
  const data = await passportService.getUserPassport(userId)
  return c.json({ success: true, data })
}

export async function getProvinceCaptures(c: Context) {
  const userId = c.get('userId')
  const province = c.req.param('province')
  const data = await passportService.getCapturesByProvince(userId, province)
  return c.json({ success: true, data })
}
