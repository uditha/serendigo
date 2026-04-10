import type { Context } from 'hono'
import * as arcService from '../services/arcs.service'

export async function getArcs(c: Context) {
  const { province, worldType } = c.req.query()
  const data = await arcService.getArcs({ province, worldType })
  return c.json({ success: true, data })
}

export async function getArcById(c: Context) {
  const id = c.req.param('id')
  const arc = await arcService.getArcById(id)

  if (!arc) return c.json({ success: false, error: 'Arc not found' }, 404)

  return c.json({ success: true, data: arc })
}

export async function getArcBySlug(c: Context) {
  const slug = c.req.param('slug')
  const arc = await arcService.getArcBySlug(slug)

  if (!arc) return c.json({ success: false, error: 'Arc not found' }, 404)

  return c.json({ success: true, data: arc })
}

export async function getChapters(c: Context) {
  const arcId = c.req.param('id')
  const data = await arcService.getChapters(arcId)
  return c.json({ success: true, data })
}

export async function enrollInArc(c: Context) {
  const userId = c.get('userId')
  const arcId = c.req.param('id')
  const data = await arcService.enrollUser(userId, arcId)
  return c.json({ success: true, data })
}

export async function getArcProgress(c: Context) {
  const userId = c.get('userId')
  const arcId = c.req.param('id')
  const data = await arcService.getUserArcProgress(userId, arcId)

  if (!data) return c.json({ success: false, error: 'Not enrolled in this arc' }, 404)

  return c.json({ success: true, data })
}

export async function getMyCaptures(c: Context) {
  const userId = c.get('userId')
  const arcId = c.req.param('id')
  const data = await arcService.getMyArcCaptures(userId, arcId)

  if (!data) return c.json({ success: false, error: 'Arc not found' }, 404)

  return c.json({ success: true, data })
}
