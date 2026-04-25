'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import { applyAsCreator } from './actions'

const PROVINCES = [
  'Western', 'Central', 'Southern', 'Northern', 'Eastern',
  'North Western', 'North Central', 'Uva', 'Sabaragamuwa',
]

export default function CreatorsLandingPage() {
  const [familyRun, setFamilyRun] = useState<'yes' | 'no' | null>(null) // placeholder for design parity
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await applyAsCreator(formData)
      setResult(res.ok ? { ok: true, message: res.message } : { ok: false, error: res.error })
      if (res.ok) (e.target as HTMLFormElement).reset()
    })
  }

  return (
    <>
      <Nav />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative bg-white" style={{ paddingTop: 140, paddingBottom: 80 }}>
          <div className="container relative z-[1]">
            <div style={{ maxWidth: 820 }}>
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: '#1d7dc8',
                  background: 'rgba(29,125,200,0.1)',
                  border: '1px solid rgba(29,125,200,0.25)',
                  padding: '6px 16px',
                  borderRadius: 100,
                  display: 'inline-block',
                  marginBottom: 28,
                }}
              >
                Creator partnerships · Invitation only
              </span>

              <h1
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(40px, 5vw, 72px)',
                  color: 'var(--sg-ink)',
                  lineHeight: 1.05,
                  marginBottom: 28,
                }}
              >
                Write stories that send people
                <br />
                <span className="sg-text-accent">into your motherland.</span>
              </h1>

              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(16px, 1.8vw, 20px)',
                  color: 'var(--sg-muted)',
                  maxWidth: 680,
                  lineHeight: 1.75,
                  marginBottom: 40,
                }}
              >
                SerendiGO publishes story arcs written by photographers, food writers, naturalists,
                and locals who know one corner of this island deeply. Apply once, get approved,
                then submit arcs. We review everything before publishing — every arc carries your
                name, photo, and link in the mobile app.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#apply"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    background: 'var(--sg-primary)',
                    color: '#ffffff',
                    padding: '16px 36px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    boxShadow: 'var(--sg-glow-accent)',
                  }}
                  className="hover:brightness-[1.03] transition-[filter]"
                >
                  Apply to become a creator →
                </a>
                <Link
                  href="/creators/login"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 15,
                    color: 'var(--sg-ink)',
                    padding: '16px 28px',
                    border: '1px solid var(--sg-border-strong)',
                    borderRadius: 100,
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.7)',
                  }}
                  className="hover:bg-white transition-colors"
                >
                  Creator login
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section style={{ background: 'var(--sg-bg-section)', padding: '96px 0' }}>
          <div className="container">
            <h2
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(30px, 3.2vw, 44px)',
                marginBottom: 48,
                color: 'var(--sg-ink)',
              }}
            >
              How the partnership works
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 28,
              }}
            >
              {[
                {
                  n: '01',
                  title: 'Apply with your angle',
                  body: 'Tell us the region and the world — food, wildlife, movement, roots, restoration — you cover best. A short sample arc idea helps.',
                },
                {
                  n: '02',
                  title: 'We review in 3–5 days',
                  body: 'We keep the bar high. Approved creators get a login and guidelines for what makes a great arc on SerendiGO.',
                },
                {
                  n: '03',
                  title: 'Draft arcs with AI polish',
                  body: 'Write your lore and tasks. Our AI editor helps match tone and length. Save drafts anytime.',
                },
                {
                  n: '04',
                  title: 'We publish. You get credit.',
                  body: 'Editors review every submission. Approved arcs carry your name, photo, and link on every chapter in the app.',
                },
              ].map((step) => (
                <div
                  key={step.n}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--sg-border-subtle)',
                    borderRadius: 24,
                    padding: 28,
                    boxShadow: 'var(--sg-shadow-card)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 28,
                      color: '#1d7dc8',
                      marginBottom: 12,
                    }}
                  >
                    {step.n}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--sg-ink)',
                      marginBottom: 10,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 15,
                      color: 'var(--sg-muted)',
                      lineHeight: 1.65,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO WE'RE LOOKING FOR ────────────────────────────────── */}
        <section style={{ background: '#fff', padding: '96px 0' }}>
          <div className="container" style={{ maxWidth: 920 }}>
            <h2
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(30px, 3.2vw, 44px)',
                marginBottom: 32,
                color: 'var(--sg-ink)',
              }}
            >
              Who we&apos;re looking for
            </h2>
            <ul
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 16,
                color: 'var(--sg-muted)',
                lineHeight: 1.8,
                paddingLeft: 20,
              }}
            >
              <li>Travel writers with published work on Sri Lanka or South Asia.</li>
              <li>Photographers who document places with care and permission.</li>
              <li>Chefs, foragers, and food researchers anchored in a region.</li>
              <li>Naturalists, trail guides, conservationists.</li>
              <li>Locals who can reveal a neighbourhood honestly — not every village wants more footfall, and we respect that.</li>
            </ul>
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 15,
                color: 'var(--sg-muted)',
                fontStyle: 'italic',
                marginTop: 24,
              }}
            >
              We pay via revenue share for published arcs once monetization launches. Until then,
              creators are recognized as founding editorial partners.
            </p>
          </div>
        </section>

        {/* ── APPLICATION FORM ─────────────────────────────────────── */}
        <section id="apply" style={{ background: 'var(--sg-bg-section)', padding: '96px 0' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <h2
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(30px, 3.2vw, 44px)',
                marginBottom: 16,
                color: 'var(--sg-ink)',
              }}
            >
              Apply to become a creator
            </h2>
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 16,
                color: 'var(--sg-muted)',
                marginBottom: 40,
                lineHeight: 1.7,
              }}
            >
              Tell us who you are and what you want to write. We review every application and reply
              within 3–5 days. If approved, you&apos;ll log in here with the email and password you
              choose below.
            </p>

            {result?.ok ? (
              <SuccessCard message={result.message} />
            ) : (
              <form onSubmit={onSubmit} style={{ display: 'grid', gap: 20 }}>
                <Row>
                  <Field label="Your name" required>
                    <input name="name" required autoComplete="name" style={INPUT_STYLE} />
                  </Field>
                  <Field label="Email" required>
                    <input name="email" type="email" required autoComplete="email" style={INPUT_STYLE} />
                  </Field>
                </Row>

                <Field
                  label="Password"
                  hint="At least 8 characters. You'll use this to log in once approved."
                  required
                >
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    style={INPUT_STYLE}
                  />
                </Field>

                <Row>
                  <Field label="Home province">
                    <select name="province" defaultValue="" style={INPUT_STYLE}>
                      <option value="">Select a province…</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p.toUpperCase().replace(/\s+/g, '_')}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Instagram (optional)">
                    <input name="instagram" placeholder="@yourhandle" style={INPUT_STYLE} />
                  </Field>
                </Row>

                <Field label="Website / portfolio (optional)">
                  <input name="website" type="url" placeholder="https://…" style={INPUT_STYLE} />
                </Field>

                <Field label="A short bio">
                  <textarea
                    name="bio"
                    rows={3}
                    placeholder="One or two sentences — where you're based, what you cover."
                    style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 90 }}
                  />
                </Field>

                <Field
                  label="Sample arc concept"
                  hint="A rough pitch for one arc you'd love to write. 3–5 sentences is plenty."
                  required
                >
                  <textarea
                    name="applicationNote"
                    rows={6}
                    required
                    placeholder="e.g. 'Street Eats of Pettah' — a 5-chapter walking arc through Colombo's wholesale bazaar, ending with a family-run lamprais shop that's been open since 1962…"
                    style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 160 }}
                  />
                </Field>

                {result?.ok === false && <ErrorBanner text={result.error ?? 'Something went wrong.'} />}

                <button
                  type="submit"
                  disabled={pending}
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    background: 'var(--sg-primary)',
                    color: '#fff',
                    padding: '16px 28px',
                    borderRadius: 100,
                    border: 'none',
                    cursor: pending ? 'default' : 'pointer',
                    opacity: pending ? 0.7 : 1,
                    boxShadow: 'var(--sg-glow-accent)',
                    marginTop: 4,
                  }}
                >
                  {pending ? 'Submitting…' : 'Submit application →'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

// ─── small bits ───────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      className="sg-nav-strip"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--sg-nav-glass)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--sg-border-subtle)',
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 }}
      >
        <Link
          href="/"
          className="flex items-center gap-2"
          style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--sg-ink)', textDecoration: 'none' }}
        >
          <span>SerendiGO</span>
          <BrandMark size={22} />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/creators/login"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--sg-muted)', textDecoration: 'none' }}
            className="hidden md:inline hover:text-sg-ink transition-colors"
          >
            Creator login
          </Link>
          <a
            href="#apply"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              background: 'var(--sg-primary)',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 100,
              textDecoration: 'none',
            }}
            className="hover:brightness-[1.03] transition-[filter]"
          >
            Apply
          </a>
        </div>
      </div>
    </nav>
  )
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 15,
  color: '#1A1A2E',
  background: '#fff',
  border: '1.5px solid #E5DDD0',
  borderRadius: 12,
  padding: '14px 18px',
  outline: 'none',
  boxSizing: 'border-box',
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A2E',
          marginBottom: 8,
          letterSpacing: 0.3,
        }}
      >
        {label}
        {required && <span style={{ color: '#1d7dc8', marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && (
        <div
          style={{
            marginTop: 6,
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 12,
            color: 'var(--sg-muted)',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>{children}</div>
}

function SuccessCard({ message }: { message?: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid rgba(29,125,200,0.3)',
        borderRadius: 20,
        padding: 32,
        boxShadow: 'var(--sg-shadow-card)',
      }}
    >
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginBottom: 10, color: 'var(--sg-ink)' }}>
        Thank you — application received.
      </div>
      <p
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 15,
          color: 'var(--sg-muted)',
          lineHeight: 1.7,
        }}
      >
        {message ?? 'We review every application within 3–5 days.'} If approved, you&apos;ll receive
        an email and can log in at any time at <strong>/creators/login</strong>.
      </p>
    </div>
  )
}

function ErrorBanner({ text }: { text: string }) {
  return (
    <div
      style={{
        background: 'rgba(231, 76, 60, 0.08)',
        border: '1px solid rgba(231, 76, 60, 0.3)',
        color: '#A8332A',
        padding: '12px 16px',
        borderRadius: 12,
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 14,
      }}
    >
      {text}
    </div>
  )
}
