import { Context } from 'hono'
import { db } from '../db'
import { districts } from '../db/schema/districts'
import { asc } from 'drizzle-orm'

export async function getDistricts(c: Context) {
  try {
    const rows = await db.select().from(districts).orderBy(asc(districts.name))
    return c.json({ success: true, data: rows })
  } catch (error) {
    console.error('getDistricts error:', error)
    return c.json({ success: false, error: 'Failed to fetch districts' }, 500)
  }
}
