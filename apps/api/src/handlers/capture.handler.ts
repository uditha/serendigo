import type { Context } from 'hono'
import { z } from 'zod'
import * as captureService from '../services/capture.service'

const captureSchema = z.object({
  chapterId: z.string().min(1),
  lat: z.string().transform(Number),
  lng: z.string().transform(Number),
  note: z.string().optional(),
})

export async function createCapture(c: Context) {
  const userId = c.get('userId')
  const formData = await c.req.formData()

  const isPublic = formData.get('isPublic') !== 'false'

  const parsed = captureSchema.safeParse({
    chapterId: formData.get('chapterId'),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
    note: formData.get('note'),
  })

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return c.json({ success: false, error: firstError ?? 'Invalid request' }, 400)
  }

  const photo = formData.get('photo')
  if (!(photo instanceof File)) {
    return c.json({ success: false, error: 'Photo is required' }, 400)
  }

  try {
    const result = await captureService.processCapture({
      userId,
      chapterId: parsed.data.chapterId,
      photo,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      note: parsed.data.note,
      isPublic,
    })
    return c.json({ success: true, data: result }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Capture failed'
    return c.json({ success: false, error: message }, 400)
  }
}
