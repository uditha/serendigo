'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import QrCodeMock from '@/components/QrCodeMock'

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
  children,
}: {
  label: string
  required?: boolean
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
    </div>
  )
}

export default function PartnersPage() {
  const [familyRun, setFamilyRun] = useState<'yes' | 'no' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#1d7dc8'
  }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#E5DDD0'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  /* Match home page: .reveal starts hidden until .visible (globals.css) */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        className="sg-nav-strip"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--sg-nav-glass)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--sg-border-subtle)' }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 }}>
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
              href="/"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 14,
                color: 'var(--sg-muted)',
                textDecoration: 'none',
              }}
              className="hidden md:inline hover:text-sg-ink transition-colors"
            >
              ← Back to home
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
              Apply now
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO ────────────────────────────────────────────────── */}
        <section className="relative flex min-h-screen items-center overflow-hidden bg-white">
          <div className="container relative z-[1] grid md:grid-cols-2 gap-12 items-center" style={{ paddingTop: 120, paddingBottom: 80 }}>
            {/* LEFT: text content */}
            <div>
              {/* Stat pills */}
              <div className="flex flex-wrap gap-3 mb-10">
                {[
                  { label: '66+ active partners', icon: '🏠' },
                  { label: 'Launching 2026', icon: '🚀' },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 1,
                      color: '#1d7dc8',
                      background: 'rgba(29,125,200,0.1)',
                      border: '1px solid rgba(29,125,200,0.25)',
                      padding: '6px 16px',
                      borderRadius: 100,
                    }}
                  >
                    {pill.icon} {pill.label}
                  </span>
                ))}
              </div>

              <h1
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(40px, 5vw, 72px)',
                  color: 'var(--sg-ink)',
                  lineHeight: 1.05,
                  marginBottom: 28,
                }}
              >
                Grow with people
                <br />
                <span className="sg-text-accent">who travel with purpose.</span>
              </h1>

              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(16px, 1.8vw, 20px)',
                  color: 'var(--sg-muted)',
                  maxWidth: 580,
                  lineHeight: 1.75,
                  marginBottom: 44,
                }}
              >
                SerendiGO connects your business with travellers who specifically seek out local,
                family-run experiences — and rewards them with coins to spend with you.
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
                    boxShadow: 'var(--sg-glow-amber)',
                  }}
                  className="hover:brightness-[1.03] transition-[filter]"
                >
                  Apply to join SerendiGO →
                </a>
                <a
                  href="#how-it-works"
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
                  See how it works
                </a>
              </div>
            </div>

            {/* RIGHT: stats / visual */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-6">
              {[
                { value: '66+', label: 'Active partners' },
                { value: '9', label: 'Provinces covered' },
                { value: '🏠', label: 'Family-run always first' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--sg-border-subtle)',
                    borderRadius: 20,
                    padding: '28px 40px',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: 280,
                    boxShadow: 'var(--sg-shadow-card)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 48,
                      color: '#1d7dc8',
                      lineHeight: 1,
                      marginBottom: 8,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 13,
                      color: 'var(--sg-muted)',
                      letterSpacing: 1,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENEFIT 1: VISIBILITY ───────────────────────────────── */}
        <section style={{ background: 'var(--sg-bg-section)', paddingTop: 96, paddingBottom: 96 }}>
          <div className="container grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="reveal mb-4"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  letterSpacing: 5,
                  color: '#1d7dc8',
                  textTransform: 'uppercase',
                }}
              >
                01 — Visibility
              </p>
              <h2
                className="reveal reveal-delay-1 mb-6"
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  color: 'var(--sg-ink)',
                  lineHeight: 1.1,
                }}
              >
                Pinned on the island.
                <br />
                Curated by hand.
              </h2>
              <p
                className="reveal reveal-delay-2"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 17,
                  color: 'var(--sg-muted)',
                  lineHeight: 1.8,
                }}
              >
                Your business appears on SerendiGO&apos;s interactive Sri Lanka map — discoverable
                by every explorer in your province. We feature you in story arcs whenever your
                location is relevant to a chapter. No algorithm games, no bidding wars. We curate
                every listing by hand.
              </p>
            </div>

            {/* Map pin graphic */}
            <div className="reveal flex items-center justify-center">
              <div style={{ position: 'relative', width: 200, height: 200 }}>
                {/* Glow rings */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: 'rgba(232,131,42,0.06)',
                    border: '1px solid rgba(232,131,42,0.15)',
                    animation: 'pulseRing 3s ease-out infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    background: 'rgba(232,131,42,0.08)',
                    border: '1px solid rgba(232,131,42,0.2)',
                    animation: 'pulseRing 3s ease-out infinite 0.8s',
                  }}
                />
                {/* Teardrop pin */}
                <div className="float-pin" style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)' }}>
                  <svg width="56" height="72" viewBox="0 0 56 72" fill="none">
                    <path
                      d="M28 2 C14 2 4 12 4 26 C4 44 28 70 28 70 C28 70 52 44 52 26 C52 12 42 2 28 2 Z"
                      fill="#1d7dc8"
                      style={{ filter: 'drop-shadow(0 0 12px rgba(232,131,42,0.8))' }}
                    />
                    <circle cx="28" cy="26" r="8" fill="white" opacity="0.9" />
                  </svg>
                </div>
                <p
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 11,
                    letterSpacing: 2,
                    color: 'var(--sg-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Your location
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENEFIT 2: COIN REDEMPTIONS ─────────────────────────── */}
        <section style={{ background: 'var(--sg-bg-rich)', paddingTop: 96, paddingBottom: 96 }}>
          <div className="container grid md:grid-cols-2 gap-16 items-center">
            {/* QR mock graphic */}
            <div className="reveal flex items-center justify-center order-2 md:order-1">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--sg-border-subtle)',
                  borderRadius: 20,
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: 'var(--sg-shadow-card)',
                }}
              >
                <QrCodeMock />
                <p
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 11,
                    letterSpacing: 2,
                    color: 'var(--sg-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  serendigo://redeem/your-id
                </p>
                <div
                  style={{
                    marginTop: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(29,125,200,0.1)',
                    border: '1px solid rgba(29,125,200,0.25)',
                    padding: '6px 14px',
                    borderRadius: 100,
                  }}
                >
                  <span style={{ fontSize: 14 }}>🪙</span>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 12,
                      color: '#1d7dc8',
                      fontWeight: 700,
                    }}
                  >
                    Printed once. Works forever.
                  </span>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <p
                className="reveal mb-4"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  letterSpacing: 5,
                  color: '#1d7dc8',
                  textTransform: 'uppercase',
                }}
              >
                02 — Coin Redemptions
              </p>
              <h2
                className="reveal reveal-delay-1 mb-6"
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  color: 'var(--sg-ink)',
                  lineHeight: 1.1,
                }}
              >
                One QR code.
                <br />
                Real discounts.
              </h2>
              <p
                className="reveal reveal-delay-2"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 17,
                  color: 'var(--sg-muted)',
                  lineHeight: 1.8,
                }}
              >
                Explorers earn Serendipity Coins as they travel and spend them with you as genuine
                discounts. We send you a printed QR code for your counter and a clean admin dashboard
                to track every redemption in real time. One QR. Zero ongoing complexity.
              </p>
            </div>
          </div>
        </section>

        {/* ── BENEFIT 3: FAMILY-RUN ───────────────────────────────── */}
        <section style={{ background: 'var(--sg-bg-partner)', paddingTop: 96, paddingBottom: 96 }}>
          <div className="container grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="reveal mb-4"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  letterSpacing: 5,
                  color: '#1d7dc8',
                  textTransform: 'uppercase',
                }}
              >
                03 — Family-run badge
              </p>
              <h2
                className="reveal reveal-delay-1 mb-6"
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  color: 'var(--sg-ink)',
                  lineHeight: 1.1,
                }}
              >
                Small should always
                <br />
                come first.
              </h2>
              <p
                className="reveal reveal-delay-2"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 17,
                  color: 'var(--sg-muted)',
                  lineHeight: 1.8,
                }}
              >
                Independently owned? We give you the family-run badge and sort you above chain
                businesses in every search result, nearby list, and discovery feed. No extra cost.
                No extra effort. Just recognition — because the island&apos;s soul lives in the
                people who give it everything.
              </p>
            </div>

            {/* Family-run badge graphic */}
            <div className="reveal flex items-center justify-center">
              <div style={{ textAlign: 'center' }}>
                <div
                  className="float-pin"
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                    background: 'linear-gradient(145deg, #eef6f0 0%, #f5faf7 100%)',
                    border: '2px solid rgba(45,110,78,0.22)',
                    borderRadius: 28,
                    padding: '40px 48px',
                  }}
                >
                  <span style={{ fontSize: 64 }}>🏠</span>
                  <div
                    style={{
                      background: 'rgba(232,131,42,0.15)',
                      border: '1.5px solid rgba(232,131,42,0.4)',
                      borderRadius: 100,
                      padding: '8px 20px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: '#1d7dc8',
                        textTransform: 'uppercase',
                      }}
                    >
                      Family run
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 13,
                      color: 'var(--sg-muted)',
                      marginTop: 4,
                    }}
                  >
                    Sorted first. Always.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────── */}
        <section
          id="how-it-works"
          style={{ background: 'var(--sg-bg-base)', paddingTop: 96, paddingBottom: 96 }}
        >
          <div className="container">
            <p
              className="reveal mb-4 text-center"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11,
                letterSpacing: 5,
                color: '#1d7dc8',
                textTransform: 'uppercase',
              }}
            >
              The process
            </p>
            <h2
              className="reveal reveal-delay-1 mb-20 text-center"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                color: 'var(--sg-ink)',
              }}
            >
              Three steps to going live.
            </h2>

            {/* Timeline */}
            <div className="grid md:grid-cols-3 gap-0 relative">
              {/* Connecting line */}
              <div
                className="hidden md:block absolute"
                style={{
                  top: 32,
                  left: '16.66%',
                  right: '16.66%',
                  height: 1,
                  background: 'linear-gradient(to right, rgba(232,131,42,0.3), rgba(232,131,42,0.3))',
                }}
              />

              {[
                {
                  num: '01',
                  icon: '✏️',
                  title: 'Apply online',
                  body: 'Fill in the short form below. Tell us about your business, what makes you special, and how you\'d like to be featured. It takes five minutes.',
                },
                {
                  num: '02',
                  icon: '🤝',
                  title: 'We review & verify',
                  body: 'Every application is reviewed by a real person. For family-run businesses we may arrange a brief call to understand your story and how best to feature you.',
                },
                {
                  num: '03',
                  icon: '🗺️',
                  title: 'You go live on the map',
                  body: 'Once approved, you\'re on the island map. We send your QR redemption code and explorers can start finding you immediately.',
                },
              ].map((step, i) => (
                <div
                  key={step.num}
                  className="reveal text-center px-8"
                  style={{ transitionDelay: `${i * 0.15}s` }}
                >
                  {/* Number circle */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(232,131,42,0.12)',
                      border: '2px solid rgba(232,131,42,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{step.icon}</span>
                  </div>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 11,
                      letterSpacing: 3,
                      color: '#1d7dc8',
                      textTransform: 'uppercase',
                      marginBottom: 12,
                      fontWeight: 700,
                    }}
                  >
                    {step.num}
                  </p>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 24,
                      color: 'var(--sg-ink)',
                      marginBottom: 12,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14,
                      color: 'var(--sg-muted)',
                      lineHeight: 1.7,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── APPLICATION FORM ─────────────────────────────────────── */}
        <section
          id="apply"
          style={{ background: 'var(--sg-cream)', paddingTop: 96, paddingBottom: 96 }}
        >
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 48px' }}>
            {submitted ? (
              <div className="text-center py-16">
                <div style={{ fontSize: 64, marginBottom: 20 }}>🌴</div>
                <h2
                  style={{
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: 40,
                    color: '#1A1A2E',
                    marginBottom: 16,
                  }}
                >
                  Application received!
                </h2>
                <p
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 16,
                    color: '#5A5A7A',
                    lineHeight: 1.7,
                    marginBottom: 32,
                  }}
                >
                  Thank you for applying to join SerendiGO. We review every application
                  personally and will be in touch within 3 working days.
                </p>
                <Link
                  href="/"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    background: '#1d7dc8',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: 100,
                    textDecoration: 'none',
                  }}
                >
                  Back to home
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-12">
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 11,
                      letterSpacing: 5,
                      color: '#1d7dc8',
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    Apply now
                  </p>
                  <h2
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 'clamp(32px, 4vw, 48px)',
                      color: '#1A1A2E',
                      marginBottom: 12,
                      lineHeight: 1.1,
                    }}
                  >
                    Tell us about
                    <br />
                    your business.
                  </h2>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 15,
                      color: '#5A5A7A',
                      lineHeight: 1.6,
                    }}
                  >
                    We review every application personally and will be in touch within 3 working days.
                  </p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Business name */}
                  <Field label="Business name" required>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amara Family Guesthouse"
                      style={INPUT_STYLE}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                  </Field>

                  {/* Category + Province */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Category" required>
                      <select
                        required
                        style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'none' }}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                      >
                        <option value="">Select category</option>
                        <option value="food">Food &amp; Drink</option>
                        <option value="stay">Accommodation</option>
                        <option value="experience">Experience / Activity</option>
                        <option value="shop">Shop / Retail</option>
                        <option value="transport">Transport</option>
                      </select>
                    </Field>
                    <Field label="Province" required>
                      <select
                        required
                        style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'none' }}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                      >
                        <option value="">Select province</option>
                        <option value="western">Western</option>
                        <option value="central">Central</option>
                        <option value="southern">Southern</option>
                        <option value="northern">Northern</option>
                        <option value="eastern">Eastern</option>
                        <option value="north_western">North Western</option>
                        <option value="north_central">North Central</option>
                        <option value="uva">Uva</option>
                        <option value="sabaragamuwa">Sabaragamuwa</option>
                      </select>
                    </Field>
                  </div>

                  {/* Contact name + Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Contact name" required>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dilani Perera"
                        style={INPUT_STYLE}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                      />
                    </Field>
                    <Field label="Email address" required>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        style={INPUT_STYLE}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                      />
                    </Field>
                  </div>

                  {/* Phone / WhatsApp */}
                  <Field label="Phone / WhatsApp">
                    <input
                      type="tel"
                      placeholder="+94 77 123 4567"
                      style={INPUT_STYLE}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                  </Field>

                  {/* Description */}
                  <Field label="Tell us about your business" required>
                    <textarea
                      required
                      rows={4}
                      placeholder="What do you offer? What makes your place special? What kind of traveller would love it?"
                      style={{ ...INPUT_STYLE, resize: 'none' }}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                  </Field>

                  {/* Family-run toggle */}
                  <Field label="Are you family-run / independently owned?" required>
                    <p
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 12,
                        color: '#5A5A7A',
                        marginBottom: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      Family-run means you own and operate it yourself — not a franchise, chain, or
                      corporate-backed property.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'yes' as const, label: 'Yes, we are 🏠' },
                        { value: 'no' as const, label: "We're a larger operation" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFamilyRun(opt.value)}
                          style={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontSize: 14,
                            fontWeight: familyRun === opt.value ? 700 : 500,
                            padding: '12px 24px',
                            borderRadius: 100,
                            border: familyRun === opt.value
                              ? '2px solid #1d7dc8'
                              : '1.5px solid #E5DDD0',
                            background: familyRun === opt.value
                              ? 'rgba(232,131,42,0.08)'
                              : '#fff',
                            color: familyRun === opt.value ? '#1d7dc8' : '#5A5A7A',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Submit */}
                  <div style={{ paddingTop: 8 }}>
                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 700,
                        fontSize: 16,
                        background: '#1d7dc8',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: 100,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      Apply to join SerendiGO →
                    </button>
                    <p
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 12,
                        color: '#5A5A7A',
                        textAlign: 'center',
                        marginTop: 16,
                        opacity: 0.7,
                      }}
                    >
                      We review every application personally and will be in touch within 3 working days.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────── */}
        <footer
          style={{ background: 'var(--sg-bg-footer)', borderTop: '1px solid var(--sg-border-subtle)', paddingTop: 64, paddingBottom: 64 }}
        >
          <div className="container grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg width="32" height="40" viewBox="0 0 200 250" fill="none">
                  <path
                    d="M100,12 C115,8 132,14 143,28 C158,46 164,70 163,96 C162,122 154,146 142,167 C130,188 114,205 96,216 C78,227 58,228 42,216 C26,204 18,184 16,162 C14,140 20,118 30,98 C40,78 54,62 64,46 C74,30 80,18 100,12 Z"
                    stroke="rgba(26,26,46,0.2)"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: 20,
                    color: 'var(--sg-ink)',
                  }}
                >
                  SerendiGO
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13,
                  color: 'var(--sg-muted)',
                  lineHeight: 1.7,
                }}
              >
                The living guide to Sri Lanka.
                <br />
                Made with ❤️ for the island.
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  letterSpacing: 3,
                  color: 'var(--sg-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Explore
              </p>
              {['For Explorers', 'For Partners', 'Download', 'About'].map((l) => (
                <Link
                  key={l}
                  href={l === 'For Partners' ? '/partners' : '/'}
                  className="block mb-3 text-sg-muted hover:text-sg-ink transition-colors"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  {l}
                </Link>
              ))}
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  letterSpacing: 3,
                  color: 'var(--sg-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Contact
              </p>
              <a
                href="mailto:hello@serendigo.app"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 14,
                  color: '#1d7dc8',
                  textDecoration: 'none',
                }}
              >
                hello@serendigo.app
              </a>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12,
                  color: 'var(--sg-muted)',
                  marginTop: 24,
                }}
              >
                © 2026 SerendiGO
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
