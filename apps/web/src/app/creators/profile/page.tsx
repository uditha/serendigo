import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentCreator, logoutCreator } from '../actions'
import BrandMark from '@/components/BrandMark'
import ProfileForm from './ProfileForm'

export default async function CreatorProfilePage() {
  const creator = await getCurrentCreator()
  if (!creator) redirect('/creators/login')
  if (creator.status !== 'approved') redirect('/creators/login')

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sg-bg-section)' }}>
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid var(--sg-border-subtle)',
          padding: '18px 0',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href="/"
            className="flex items-center gap-2"
            style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--sg-ink)', textDecoration: 'none' }}
          >
            <span>SerendiGO</span>
            <BrandMark size={22} />
            <span
              style={{
                marginLeft: 12,
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: '#1d7dc8',
                background: 'rgba(29,125,200,0.1)',
                border: '1px solid rgba(29,125,200,0.25)',
                padding: '4px 10px',
                borderRadius: 100,
              }}
            >
              Creators
            </span>
          </Link>
          <div className="flex items-center gap-4" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14 }}>
            <Link href="/creators/dashboard" style={{ color: 'var(--sg-muted)', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <form action={logoutCreator}>
              <button
                type="submit"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13,
                  background: 'transparent',
                  border: '1px solid var(--sg-border-strong)',
                  color: 'var(--sg-ink)',
                  padding: '6px 14px',
                  borderRadius: 100,
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="container" style={{ padding: '48px 0' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 40, color: 'var(--sg-ink)' }}>
            Your profile
          </h1>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, color: 'var(--sg-muted)', marginTop: 6 }}>
            Your photo and bio appear on arcs you publish.
          </p>
        </div>

        <ProfileForm creator={creator} />
      </section>
    </main>
  )
}
