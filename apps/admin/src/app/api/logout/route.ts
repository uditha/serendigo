import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
  return NextResponse.redirect(new URL('/login', process.env.PAYLOAD_URL ?? 'http://localhost:3001'))
}
