import { NextRequest, NextResponse } from 'next/server'
import { or, eq } from 'drizzle-orm'
import { db } from '@/db'
import { creators } from '@/db/schema'
import { setSession } from '@/lib/auth'

function loginError(req: NextRequest, msg: string) {
  const url = new URL('/creators/login', req.url)
  url.searchParams.set('error', msg)
  return NextResponse.redirect(url)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // Verify CSRF state
  const savedState = req.cookies.get('google_oauth_state')?.value
  const res = NextResponse.redirect(new URL('/creators/dashboard', req.url))
  res.cookies.delete('google_oauth_state')

  if (!code || !state || state !== savedState) {
    return loginError(req, 'google_state_mismatch')
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenRes.ok) return loginError(req, 'google_token_exchange_failed')

  const { access_token } = await tokenRes.json() as { access_token: string }

  // Fetch Google user info
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!userInfoRes.ok) return loginError(req, 'google_userinfo_failed')

  const { id: googleId, email, picture } = await userInfoRes.json() as {
    id: string
    email: string
    picture?: string
  }

  // Find creator by Google ID or email
  const rows = await db
    .select()
    .from(creators)
    .where(or(eq(creators.googleId, googleId), eq(creators.email, email)))
    .limit(1)

  const creator = rows[0]
  if (!creator) return loginError(req, 'no_creator_account')
  if (creator.status === 'pending') return loginError(req, 'application_pending')
  if (creator.status === 'rejected') return loginError(req, 'application_rejected')
  if (creator.status === 'suspended') return loginError(req, 'account_suspended')

  // Link Google ID and backfill photo if not set
  const updates: Partial<typeof creators.$inferInsert> = {}
  if (!creator.googleId) updates.googleId = googleId
  if (!creator.photo && picture) updates.photo = picture
  if (Object.keys(updates).length > 0) {
    await db.update(creators).set(updates).where(eq(creators.id, creator.id))
  }

  await setSession(creator.id)

  const redirect = NextResponse.redirect(new URL('/creators/dashboard', req.url))
  redirect.cookies.delete('google_oauth_state')
  return redirect
}
