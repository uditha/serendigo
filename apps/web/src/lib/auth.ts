import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import { db } from '@/db'
import { creators, type Creator } from '@/db/schema'
import { eq } from 'drizzle-orm'

const COOKIE_NAME = 'creator_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30  // 30 days

function secret() {
  const s = process.env.CREATOR_SESSION_SECRET
  if (!s) throw new Error('CREATOR_SESSION_SECRET env var not set')
  return s
}

function sign(creatorId: string): string {
  const hmac = createHmac('sha256', secret())
  hmac.update(creatorId)
  return `${creatorId}.${hmac.digest('hex')}`
}

function verify(token: string): string | null {
  const [creatorId, sig] = token.split('.')
  if (!creatorId || !sig) return null
  const hmac = createHmac('sha256', secret())
  hmac.update(creatorId)
  const expected = hmac.digest('hex')
  try {
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length) return null
    return timingSafeEqual(a, b) ? creatorId : null
  } catch {
    return null
  }
}

/** Called after a valid login — sets session cookie */
export async function setSession(creatorId: string) {
  const token = sign(creatorId)
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function clearSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/** Get the current logged-in creator or null. Safe to call in server components. */
export async function getCurrentCreator(): Promise<Creator | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const id = verify(token)
  if (!id) return null
  const rows = await db.select().from(creators).where(eq(creators.id, id)).limit(1)
  return rows[0] ?? null
}

/** Require an approved creator session; throws redirect if not */
export async function requireApprovedCreator(): Promise<Creator> {
  const c = await getCurrentCreator()
  if (!c) throw new Error('NOT_LOGGED_IN')
  if (c.status !== 'approved') throw new Error('NOT_APPROVED')
  return c
}
