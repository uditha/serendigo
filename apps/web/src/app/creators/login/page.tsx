'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import { loginCreator } from '../actions'

export default function CreatorLoginPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

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
