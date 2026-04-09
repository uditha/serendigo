import type { Context } from 'hono'
import * as arcService from '../services/arcs.service'

export async function getArcs(c: Context) {
  const { province, worldType } = c.req.query()
  const data = await arcService.getArcs({ province, worldType })
  return c.json({ success: true, data })
}

export async function getArcById(c: Context) {
  const arc = await arcService.getArcById(c.req.param('id'))
  if (!arc) return c.json({ success: false, error: 'Arc not found' }, 404)
  return c.json({ success: true, data: arc })
}

export async function getArcBySlug(c: Context) {
  const arc = await arcService.getArcBySlug(c.req.param('slug'))
  if (!arc) return c.json({ success: false, error: 'Arc not found' }, 404)
  return c.json({ success: true, data: arc })
}

export async function getArcProgress(c: Context) {
  const userId = c.get('userId')
  const arcId = c.req.param('id')
  const data = await arcService.getUserArcProgress(userId, arcId)
  return c.json({ success: true, data })
}
