'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'

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
        {required && <span style={{ color: '#E8832A', marginLeft: 4 }}>*</span>}
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
    e.currentTarget.style.borderColor = '#E8832A'
  }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#E5DDD0'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'rgba(13,11,24,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <Link
          href="/"
          style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#F7F0E3', textDecoration: 'none' }}
        >
          SerendiGO <span style={{ color: '#E8832A' }}>🌴</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 14,
              color: '#F7F0E3',
              opacity: 0.65,
              textDecoration: 'none',
            }}
            className="hidden md:inline hover:opacity-100 transition-opacity"
          >
            ← Back to home
          </Link>
          <a
            href="#apply"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 14,
              background: '#E8832A',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: 100,
              textDecoration: 'none',
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Apply now
          </a>
        </div>
      </nav>

      <main>
        {/* ── HERO ────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0D0B18 0%, #0D2B38 60%, #0D1F12 100%)' }}
        >
          {/* Radial accent */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: 0,
              background:
                'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(26,107,122,0.18) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 px-8 md:px-20 max-w-5xl pt-36 pb-24">
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
                    color: '#E8832A',
                    background: 'rgba(232,131,42,0.12)',
                    border: '1px solid rgba(232,131,42,0.3)',
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
                fontSize: 'clamp(48px, 7vw, 88px)',
                color: '#F7F0E3',
                lineHeight: 1.05,
                marginBottom: 28,
              }}
            >
              Grow with people
              <br />
              <span style={{ color: '#E8832A' }}>who travel with purpose.</span>
            </h1>

            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(16px, 1.8vw, 20px)',
                color: '#F7F0E3',
                opacity: 0.7,
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
                className="pulse-cta"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  background: '#E8832A',
                  color: '#fff',
                  padding: '16px 36px',
                  borderRadius: 100,
                  textDecoration: 'none',
                }}
              >
                Apply to join SerendiGO →
              </a>
              <a
                href="#how-it-works"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 15,
                  color: '#F7F0E3',
                  opacity: 0.6,
                  padding: '16px 28px',
                  border: '1px solid rgba(247,240,227,0.2)',
                  borderRadius: 100,
                  textDecoration: 'none',
                }}
                className="hover:opacity-100 transition-opacity"
              >
                See how it works
              </a>
            </div>
          </div>
        </section>

        {/* ── BENEFIT 1: VISIBILITY ───────────────────────────────── */}
        <section className="py-28 px-8 md:px-20" style={{ background: '#0D1526' }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="reveal mb-4"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  letterSpacing: 5,
                  color: '#E8832A',
                  textTransform: 'uppercase',
                }}
              >
                01 — Visibility
              </p>
              <h2
                className="reveal reveal-delay-1 mb-6"
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  color: '#F7F0E3',
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
                  color: '#F7F0E3',
                  opacity: 0.65,
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
                      fill="#E8832A"
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
                    color: 'rgba(247,240,227,0.35)',
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
        <section className="py-28 px-8 md:px-20" style={{ background: '#08070F' }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            {/* QR mock graphic */}
            <div className="reveal flex items-center justify-center order-2 md:order-1">
              <div
                style={{
                  background: 'rgba(247,240,227,0.04)',
                  border: '1px solid rgba(247,240,227,0.1)',
                  borderRadius: 20,
                  padding: 32,
                  textAlign: 'center',
                }}
              >
                {/* CSS QR code grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(9, 1fr)',
                    gap: 3,
                    width: 160,
                    marginBottom: 16,
                  }}
                >
                  {Array.from({ length: 81 }).map((_, i) => {
                    // Create a QR-like pattern (corners + random middle)
                    const row = Math.floor(i / 9)
                    const col = i % 9
                    const isCornerBlock =
                      (row < 3 && col < 3) ||
                      (row < 3 && col > 5) ||
                      (row > 5 && col < 3)
                    const isCornerInner =
                      (row === 1 && col === 1) ||
                      (row === 1 && col === 7) ||
                      (row === 7 && col === 1)
                    const filled = isCornerBlock && !isCornerInner
                      ? true
                      : !isCornerBlock && Math.random() > 0.5
                    return (
                      <div
                        key={i}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          background: filled ? '#F7F0E3' : 'transparent',
                          borderRadius: 1,
                          opacity: filled ? 0.85 : 0,
                        }}
                      />
                    )
                  })}
                </div>
                <p
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 11,
                    letterSpacing: 2,
                    color: 'rgba(247,240,227,0.35)',
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
                    background: 'rgba(232,131,42,0.12)',
                    border: '1px solid rgba(232,131,42,0.3)',
                    padding: '6px 14px',
                    borderRadius: 100,
                  }}
                >
                  <span style={{ fontSize: 14 }}>🪙</span>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 12,
                      color: '#E8832A',
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
                  color: '#E8832A',
                  textTransform: 'uppercase',
                }}
              >
                02 — Coin Redemptions
              </p>
              <h2
                className="reveal reveal-delay-1 mb-6"
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  color: '#F7F0E3',
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
                  color: '#F7F0E3',
                  opacity: 0.65,
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
        <section className="py-28 px-8 md:px-20" style={{ background: '#0D2B38' }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="reveal mb-4"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  letterSpacing: 5,
                  color: '#E8832A',
                  textTransform: 'uppercase',
                }}
              >
                03 — Family-run badge
              </p>
              <h2
                className="reveal reveal-delay-1 mb-6"
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  color: '#F7F0E3',
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
                  color: '#F7F0E3',
                  opacity: 0.65,
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
                    background: 'linear-gradient(135deg, #1A3322, #1F3D2A)',
                    border: '2px solid rgba(45,110,78,0.4)',
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
                        color: '#E8832A',
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
                      color: 'rgba(247,240,227,0.5)',
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
          className="py-28 px-8 md:px-20"
          style={{ background: '#0D0B18' }}
        >
          <div className="max-w-6xl mx-auto">
            <p
              className="reveal mb-4 text-center"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11,
                letterSpacing: 5,
                color: '#E8832A',
                textTransform: 'uppercase',
              }}
            >
              The process
            </p>
            <h2
              className="reveal reveal-delay-1 mb-20 text-center"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(30px, 4vw, 48px)',
                color: '#F7F0E3',
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
                      color: '#E8832A',
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
                      color: '#F7F0E3',
                      marginBottom: 12,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14,
                      color: '#F7F0E3',
                      opacity: 0.55,
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
          className="py-28 px-8 md:px-20"
          style={{ background: '#F7F0E3' }}
        >
          <div className="max-w-2xl mx-auto">
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
                    background: '#E8832A',
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
                      color: '#E8832A',
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
                              ? '2px solid #E8832A'
                              : '1.5px solid #E5DDD0',
                            background: familyRun === opt.value
                              ? 'rgba(232,131,42,0.08)'
                              : '#fff',
                            color: familyRun === opt.value ? '#E8832A' : '#5A5A7A',
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
                        background: '#E8832A',
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
          className="py-16 px-8 md:px-20"
          style={{ background: '#08070F', borderTop: '1px solid rgba(247,240,227,0.06)' }}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg width="32" height="40" viewBox="0 0 200 250" fill="none">
                  <path
                    d="M100,12 C115,8 132,14 143,28 C158,46 164,70 163,96 C162,122 154,146 142,167 C130,188 114,205 96,216 C78,227 58,228 42,216 C26,204 18,184 16,162 C14,140 20,118 30,98 C40,78 54,62 64,46 C74,30 80,18 100,12 Z"
                    stroke="rgba(247,240,227,0.3)"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: 20,
                    color: '#F7F0E3',
                  }}
                >
                  SerendiGO
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13,
                  color: 'rgba(247,240,227,0.4)',
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
                  color: 'rgba(247,240,227,0.3)',
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
                  className="block mb-3"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 14,
                    color: 'rgba(247,240,227,0.55)',
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
                  color: 'rgba(247,240,227,0.3)',
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
                  color: '#E8832A',
                  textDecoration: 'none',
                }}
              >
                hello@serendigo.app
              </a>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12,
                  color: 'rgba(247,240,227,0.25)',
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
