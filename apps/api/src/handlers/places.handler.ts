import type { Context } from 'hono'
import { z } from 'zod'
import * as placesService from '../services/places.service'

const nearbySchema = z.object({
  lat: z.string().transform(Number),
  lng: z.string().transform(Number),
  radius: z.string().transform(Number).optional(),
  category: z.string().optional(),
  worldType: z.string().optional(),
})

export async function getNearby(c: Context) {
  const parsed = nearbySchema.safeParse(c.req.query())
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.flatten() }, 400)
  }
  const { lat, lng, radius, category, worldType } = parsed.data
  const data = await placesService.getNearbyPlaces(lat, lng, { radius, category, worldType })
  return c.json({ success: true, data })
}

export async function getPlaceById(c: Context) {
  const id = c.req.param('id')
  const place = await placesService.getPlaceById(id)
  if (!place) return c.json({ success: false, error: 'Place not found' }, 404)
  return c.json({ success: true, data: place })
}

export async function getPlaceBySlug(c: Context) {
  const slug = c.req.param('slug')
  const place = await placesService.getPlaceBySlug(slug)
  if (!place) return c.json({ success: false, error: 'Place not found' }, 404)
  return c.json({ success: true, data: place })
}

export async function getArcsForPlace(c: Context) {
  const id = c.req.param('id')
  const data = await placesService.getArcsForPlace(id)
  return c.json({ success: true, data })
}

const captureSchema = z.object({
  lat: z.string().transform(Number),
  lng: z.string().transform(Number),
  note: z.string().optional(),
})

export async function capturePlace(c: Context) {
  const userId = c.get('userId')
  const placeId = c.req.param('id')
  const formData = await c.req.formData()

  const parsed = captureSchema.safeParse({
    lat: formData.get('lat'),
    lng: formData.get('lng'),
    note: formData.get('note'),
  })

  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.flatten() }, 400)
  }

  const photo = formData.get('photo')
  const result = await placesService.capturePlace({
    userId,
    placeId,
    photo: photo instanceof File ? photo : undefined,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    note: parsed.data.note,
  })

  return c.json({ success: true, data: result }, 201)
}
