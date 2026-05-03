'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import { loginCreator } from '../actions'

const GOOGLE_ERRORS: Record<string, string> = {
  google_not_configured: 'Google login is not configured yet.',
  google_state_mismatch: 'Login attempt expired. Please try again.',
  google_token_exchange_failed: 'Could not complete Google sign-in. Try again.',
  google_userinfo_failed: 'Could not retrieve your Google account info.',
  no_creator_account: 'No creator account found for this Google email. Please apply first.',
  application_pending: 'Your application is still under review.',
  application_rejected: 'Your application was not approved.',
  account_suspended: 'This account is suspended.',
}

export default function CreatorLoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errKey = params.get('error')
    if (errKey) setError(GOOGLE_ERRORS[errKey] ?? 'An error occurred. Please try again.')
  }, [params])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await loginCreator(formData)
      if (res.ok) {
        router.push('/creators/dashboard')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sg-bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          border: '1px solid var(--sg-border-subtle)',
          borderRadius: 24,
          padding: 40,
          boxShadow: 'var(--sg-shadow-card)',
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2"
          style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--sg-ink)', textDecoration: 'none', marginBottom: 28 }}
        >
          <span>SerendiGO</span>
          <BrandMark size={22} />
        </Link>

        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: 'var(--sg-ink)', marginBottom: 8 }}>
          Creator login
        </h1>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--sg-muted)', marginBottom: 28 }}>
          Approved creators only.{' '}
          <Link href="/creators" style={{ color: '#1d7dc8' }}>
            Apply here
          </Link>{' '}
          if you haven&apos;t yet.
        </p>

        {/* Google button */}
        <a
          href="/api/auth/google"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            padding: '13px 20px',
            borderRadius: 100,
            border: '1.5px solid #E5DDD0',
            background: '#fff',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#1A1A2E',
            textDecoration: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box' as const,
            marginBottom: 20,
          }}
        >
          <GoogleIcon />
          Continue with Google
        </a>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#E5DDD0' }} />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--sg-muted)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#E5DDD0' }} />
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={LABEL_STYLE}>
            Email
            <input name="email" type="email" required autoComplete="email" style={INPUT_STYLE} />
          </label>
          <label style={LABEL_STYLE}>
            Password
            <input name="password" type="password" required autoComplete="current-password" style={INPUT_STYLE} />
          </label>

          {error && (
            <div
              style={{
                background: 'rgba(231, 76, 60, 0.08)',
                border: '1px solid rgba(231, 76, 60, 0.3)',
                color: '#A8332A',
                padding: '10px 14px',
                borderRadius: 10,
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              background: 'var(--sg-primary)',
              color: '#fff',
              padding: '14px 24px',
              borderRadius: 100,
              border: 'none',
              cursor: pending ? 'default' : 'pointer',
              opacity: pending ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 13,
  fontWeight: 600,
  color: '#1A1A2E',
  letterSpacing: 0.3,
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  fontFamily: 'Space Grotesk, sans-serif',
  fontWeight: 400,
  fontSize: 15,
  color: '#1A1A2E',
  background: '#fff',
  border: '1.5px solid #E5DDD0',
  borderRadius: 12,
  padding: '12px 16px',
  outline: 'none',
  boxSizing: 'border-box',
}
