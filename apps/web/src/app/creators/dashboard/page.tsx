import Link from 'next/link'
import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { arcSubmissions } from '@/db/schema'
import { getCurrentCreator, logoutCreator } from '../actions'
import BrandMark from '@/components/BrandMark'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  draft:     { bg: 'rgba(90,90,122,0.10)',  color: '#4d4d68', label: 'Draft' },
  submitted: { bg: 'rgba(29,125,200,0.12)', color: '#135a94', label: 'In review' },
  approved:  { bg: 'rgba(39,174,96,0.12)',  color: '#1e7a42', label: 'Approved' },
  rejected:  { bg: 'rgba(231,76,60,0.12)',  color: '#A8332A', label: 'Needs changes' },
  published: { bg: 'rgba(39,174,96,0.18)',  color: '#1e7a42', label: 'Published' },
}

export default async function CreatorDashboardPage() {
  const creator = await getCurrentCreator()
  if (!creator) redirect('/creators/login')
  if (creator.status !== 'approved') redirect('/creators/login')

  const submissions = await db
    .select()
    .from(arcSubmissions)
    .where(eq(arcSubmissions.creatorId, creator.id))
    .orderBy(desc(arcSubmissions.updatedAt))

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
            <span style={{ color: 'var(--sg-muted)' }}>{creator.name}</span>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 40, color: 'var(--sg-ink)' }}>
              Welcome, {creator.name.split(' ')[0]}.
            </h1>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, color: 'var(--sg-muted)', marginTop: 6 }}>
              Your submissions appear below. Drafts save as you go; submitting sends an arc to our editors.
            </p>
          </div>
          <Link
            href="/creators/submit"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              background: 'var(--sg-primary)',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: 100,
              textDecoration: 'none',
              boxShadow: 'var(--sg-glow-accent)',
            }}
          >
            + New arc submission
          </Link>
        </div>

        {submissions.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {submissions.map((s) => {
              const chapters = (s.chapters as unknown[] | null) ?? []
              const chapterCount = Array.isArray(chapters) ? chapters.length : 0
              const style = STATUS_STYLE[s.status] ?? STATUS_STYLE.draft
              const editable = s.status === 'draft' || s.status === 'rejected' || s.status === 'submitted'
              return (
                <article
                  key={s.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--sg-border-subtle)',
                    borderRadius: 20,
                    padding: 24,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 16,
                    alignItems: 'center',
                    boxShadow: 'var(--sg-shadow-card)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          background: style.bg,
                          color: style.color,
                          padding: '4px 10px',
                          borderRadius: 100,
                        }}
                      >
                        {style.label}
                      </span>
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--sg-muted)' }}>
                        {s.worldType} · {s.province.replace(/_/g, ' ').toLowerCase()} · {chapterCount} chapters
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--sg-ink)' }}>
                      {s.title}
                    </h2>
                    {s.tagline && (
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--sg-muted)', marginTop: 4 }}>
                        {s.tagline}
                      </p>
                    )}
                    {s.status === 'rejected' && s.adminFeedback && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: '10px 14px',
                          background: 'rgba(231,76,60,0.08)',
                          border: '1px solid rgba(231,76,60,0.25)',
                          borderRadius: 12,
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 13,
                          color: '#A8332A',
                        }}
                      >
                        <strong>Editor feedback:</strong> {s.adminFeedback}
                      </div>
                    )}
                  </div>
                  <div>
                    {editable ? (
                      <Link
                        href={`/creators/submit/${s.id}`}
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 13,
                          fontWeight: 600,
                          padding: '10px 20px',
                          borderRadius: 100,
                          background: '#fff',
                          border: '1px solid var(--sg-border-strong)',
                          color: 'var(--sg-ink)',
                          textDecoration: 'none',
                        }}
                      >
                        {s.status === 'submitted' ? 'View' : 'Edit'} →
                      </Link>
                    ) : (
                      <Link
                        href={`/creators/submit/${s.id}`}
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 13,
                          fontWeight: 600,
                          padding: '10px 20px',
                          borderRadius: 100,
                          background: 'transparent',
                          color: 'var(--sg-muted)',
                          textDecoration: 'none',
                        }}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px dashed var(--sg-border-strong)',
        borderRadius: 24,
        padding: 56,
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: 'var(--sg-ink)', marginBottom: 10 }}>
        No submissions yet.
      </div>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, color: 'var(--sg-muted)', marginBottom: 24, maxWidth: 520, margin: '0 auto 24px' }}>
        Start your first arc. You can save a draft at any stage and come back later — we only review
        arcs when you hit submit.
      </p>
      <Link
        href="/creators/submit"
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: 15,
          background: 'var(--sg-primary)',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: 100,
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Start your first arc →
      </Link>
    </div>
  )
}
