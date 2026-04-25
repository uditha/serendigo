'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import SriLankaMap from '@/components/SriLankaMap'

/* ── Sri Lanka simplified province data ─────────────────────────────── */
const PROVINCES = [
  { id: 'western',       label: 'Western',     cx: 72,  cy: 168, r: 18, worldColor: '#B85C1A' },
  { id: 'central',       label: 'Central',     cx: 105, cy: 148, r: 16, worldColor: '#2D6E4E' },
  { id: 'southern',      label: 'Southern',    cx: 88,  cy: 200, r: 16, worldColor: '#1d7dc8' },
  { id: 'northern',      label: 'Northern',    cx: 100, cy: 50,  r: 20, worldColor: '#614A9E' },
  { id: 'eastern',       label: 'Eastern',     cx: 145, cy: 130, r: 16, worldColor: '#1A5F8A' },
  { id: 'north_western', label: 'NW',          cx: 68,  cy: 110, r: 14, worldColor: '#5E8C6E' },
  { id: 'north_central', label: 'NC',          cx: 105, cy: 105, r: 16, worldColor: '#8E44AD' },
  { id: 'uva',           label: 'Uva',         cx: 125, cy: 170, r: 14, worldColor: '#1d7dc8' },
  { id: 'sabaragamuwa',  label: 'Sabaragamuwa', cx: 92, cy: 172, r: 13, worldColor: '#2D6E4E' },
]

const ARCS = [
  { world: 'TASTE',   emoji: '🍛', color: '#B85C1A', title: 'The Colombo Street Food Circuit',  province: 'western',       chapters: 6, desc: 'From Pettah to Slave Island. The real city, eaten slowly.' },
  { world: 'WILD',    emoji: '🌿', color: '#2D6E4E', title: 'The Elephant Circuit',              province: 'north_central', chapters: 5, desc: 'Minneriya, Kaudulla, Hurulu. Three parks, one ancient migration.' },
  { world: 'MOVE',    emoji: '⚡', color: '#1A5F8A', title: 'The Great Train Journey',           province: 'central',       chapters: 7, desc: 'Colombo Fort to Badulla. Nine hours. A thousand views.' },
  { world: 'ROOTS',   emoji: '🏛️', color: '#614A9E', title: 'The Ancient Kingdoms',              province: 'northern',      chapters: 8, desc: 'Anuradhapura to Polonnaruwa. Kingdoms under the banyan.' },
  { world: 'RESTORE', emoji: '🧘', color: '#5E8C6E', title: 'Ayurveda & the Hill Country',       province: 'uva',           chapters: 5, desc: 'Nuwara Eliya to Haputale. Rest was never this earned.' },
]

const ORBIT_NODES = [
  { angle: 0,   emoji: '🗺️', label: 'Explore' },
  { angle: 90,  emoji: '📸', label: 'Capture' },
  { angle: 180, emoji: '🪙', label: 'Earn' },
  { angle: 270, emoji: '🏠', label: 'Spend' },
]

const HERO_PROVINCE_IDS = ['western','central','southern','northern','eastern','north_western','north_central','uva','sabaragamuwa']

const PROVINCE_COLORS_MAP: Record<string, string> = {
  western:'#B85C1A', central:'#2D6E4E', southern:'#1A5F8A', northern:'#614A9E',
  eastern:'#1A6B7A', north_western:'#5E8C6E', north_central:'#8E44AD',
  uva:'#1d7dc8', sabaragamuwa:'#C0392B',
}
const PROVINCE_LABELS: Record<string, string> = {
  western:'Western', central:'Central', southern:'Southern', northern:'Northern',
  eastern:'Eastern', north_western:'North Western', north_central:'North Central',
  uva:'Uva', sabaragamuwa:'Sabaragamuwa',
}

const PARTNER_VIGNETTES = [
  { name: "Ravi's Kottu Corner", type: 'FOOD', province: 'Western', delay: 0, familyRun: true },
  { name: "Dilani's Ella Nest", type: 'STAY', province: 'Uva', delay: 0.12, familyRun: true },
  { name: 'Asanka Spice Garden', type: 'EXPERIENCE', province: 'Central', delay: 0.24, familyRun: false },
  { name: 'Nimal Beach Cabanas', type: 'STAY', province: 'Southern', delay: 0.36, familyRun: true },
] as const

const STACK_STEP_TOP = 48
const STACK_STEP_RIGHT = 14
const STACK_ROTATE_MS = 1_000

export default function Home() {
  const [heroProvinceIdx, setHeroProvinceIdx] = useState(0)
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [partnerStackFront, setPartnerStackFront] = useState(0)
  const counterRef = useRef<HTMLSpanElement>(null)
  const counterDone = useRef(false)

  /* Preloader */
  useEffect(() => {
    const t = setTimeout(() => setPreloaderDone(true), 2000)
    return () => clearTimeout(t)
  }, [])

  /* Hero province cycling */
  useEffect(() => {
    const id = setInterval(() => setHeroProvinceIdx(i => (i + 1) % HERO_PROVINCE_IDS.length), 6000)
    return () => clearInterval(id)
  }, [])

  /* Partner deck: every second the front card cycles — top/right animate */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const n = PARTNER_VIGNETTES.length
    const id = window.setInterval(() => {
      setPartnerStackFront((f) => (f + 1) % n)
    }, STACK_ROTATE_MS)
    return () => window.clearInterval(id)
  }, [])

  /* Hero / theme: keep sky token white */
  useEffect(() => {
    document.documentElement.style.setProperty('--sky', '#ffffff')
  }, [])

  /* Intersection observer for reveals + counter */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            // Counter animation
            if (e.target === counterRef.current && !counterDone.current) {
              counterDone.current = true
              let val = 0
              const target = 66
              const tick = () => {
                val = Math.min(target, val + 2)
                if (counterRef.current) counterRef.current.textContent = val + '+'
                if (val < target) requestAnimationFrame(tick)
              }
              requestAnimationFrame(tick)
            }
          }
        })
      },
      { threshold: 0.12 }
    )

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    if (counterRef.current) io.observe(counterRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* ── Preloader ──────────────────────────────────────────── */}
      <div id="preloader" className={preloaderDone ? 'hidden' : ''}>
        <div className="flex flex-col items-center gap-6">
          <svg width="120" height="150" viewBox="0 0 200 250" fill="none" style={{ color: 'var(--sg-primary)' }}>
            <path
              d="M100,12 C115,8 132,14 143,28 C158,46 164,70 163,96 C162,122 154,146 142,167 C130,188 114,205 96,216 C78,227 58,228 42,216 C26,204 18,184 16,162 C14,140 20,118 30,98 C40,78 54,62 64,46 C74,30 80,18 100,12 Z"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
          <div
            style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: 28,
              color: 'var(--sg-ink)',
              letterSpacing: 2,
            }}
          >
            SerendiGO
          </div>
        </div>
      </div>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav
        className="sg-nav-strip"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--sg-nav-glass)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--sg-border-subtle)' }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 }}>
          <div className="flex items-center gap-2" style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--sg-ink)' }}>
            <span>SerendiGO</span>
            <BrandMark size={22} />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['For Explorers', 'How It Works', 'Blog'].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s/g, '-')}`}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 14,
                  color: 'var(--sg-muted)',
                }}
                className="hover:text-sg-ink transition-colors"
              >
                {l}
              </a>
            ))}
            <Link
              href="/partners"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                background: 'transparent',
                color: 'var(--sg-secondary)',
                padding: '8px 18px',
                borderRadius: 100,
                border: '1.5px solid var(--sg-secondary)',
              }}
              className="hover:bg-[rgba(26,107,122,0.06)] transition-colors"
            >
              For Partners
            </Link>
            <Link
              href="/creators"
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
              For Creators
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section
          id="for-explorers"
          className="relative flex min-h-screen items-center overflow-hidden bg-white"
        >
          <div className="container relative z-[1] grid md:grid-cols-2 gap-12 items-center" style={{ paddingTop: 120, paddingBottom: 80 }}>
            {/* LEFT: text content */}
            <div>
              <p
                className="mb-6"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12,
                  letterSpacing: 5,
                  color: 'var(--sg-primary)',
                  textTransform: 'uppercase',
                }}
              >
                The Living Guide to Sri Lanka
              </p>
              <h1
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(32px, 3.2vw, 52px)',
                  color: 'var(--sg-ink)',
                  lineHeight: 1.1,
                  marginBottom: 28,
                }}
              >
                Before you know it,
                <br />
                <span className="sg-text-accent">you&apos;ll miss it.</span>
              </h1>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  color: 'var(--sg-muted)',
                  maxWidth: 520,
                  lineHeight: 1.7,
                  marginBottom: 48,
                }}
              >
                SerendiGO is the living guide. Follow story arcs across 9 provinces, collect stamps
                on your passport, earn coins — and spend them with the families who make this island
                extraordinary.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href="#how-it-works"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    background: 'var(--sg-primary)',
                    color: '#ffffff',
                    padding: '14px 32px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    boxShadow: 'var(--sg-glow-amber)',
                  }}
                  className="hover:brightness-[1.03] transition-[filter]"
                >
                  Begin the journey
                </a>
                <Link
                  href="/partners"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 15,
                    color: 'var(--sg-ink)',
                    padding: '14px 24px',
                    border: '1px solid var(--sg-border-strong)',
                    borderRadius: 100,
                    textDecoration: 'none',
                    background: '#ffffff',
                  }}
                  className="hover:bg-sg-section transition-colors"
                >
                  I have a local business →
                </Link>
              </div>

              {/* World type pills */}
              <div className="flex flex-wrap gap-2 mt-12">
                {[
                  { label: 'Taste',   emoji: '🍛', color: '#B85C1A' },
                  { label: 'Wild',    emoji: '🌿', color: '#2D6E4E' },
                  { label: 'Move',    emoji: '⚡', color: '#1A5F8A' },
                  { label: 'Roots',   emoji: '🏛️', color: '#614A9E' },
                  { label: 'Restore', emoji: '🧘', color: '#5E8C6E' },
                ].map((w) => (
                  <span
                    key={w.label}
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      background: '#ffffff',
                      color: w.color,
                      border: `1px solid ${w.color}66`,
                      boxShadow: '0 1px 2px rgba(26,26,46,0.06)',
                      padding: '6px 14px',
                      borderRadius: 100,
                    }}
                  >
                    {w.emoji} {w.label}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: island map + province arc card */}
            {(() => {
              const activeProvince = HERO_PROVINCE_IDS[heroProvinceIdx]
              const provinceColor = PROVINCE_COLORS_MAP[activeProvince] ?? '#1d7dc8'
              const provinceArc = ARCS.find(a => a.province === activeProvince)
              return (
                <div className="hidden lg:flex" style={{ justifyContent: 'flex-end', alignItems: 'center', position: 'relative', width: 360, height: 600, marginLeft: 40 }}>
                  <SriLankaMap
                    goldenBorder
                    width={360}
                    height={600}
                    style={{ animation: 'islandFloat 9s ease-in-out infinite' }}
                  />

                  {/* Province info card */}
                  <div
                    key={heroProvinceIdx}
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: -150,
                      width: 240,
                      borderRadius: 20,
                      overflow: 'hidden',
                      animation: 'fadeInUp 2s ease',
                      boxShadow: 'var(--sg-shadow-card)',
                    }}
                  >
                    {provinceArc ? (
                      <>
                        {/* Coloured header band */}
                        <div style={{
                          background: `linear-gradient(135deg, ${provinceColor}EE, ${provinceColor}99)`,
                          padding: '16px 18px 14px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>{provinceArc.world}</span>
                            <span style={{ fontSize: 24 }}>{provinceArc.emoji}</span>
                          </div>
                          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 17, color: '#fff', lineHeight: 1.2 }}>{provinceArc.title}</div>
                        </div>

                        {/* White body */}
                        <div style={{ background: '#FDFAF5', padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: provinceColor }} />
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 600, color: '#5A5A7A', letterSpacing: 1, textTransform: 'uppercase' }}>{PROVINCE_LABELS[activeProvince]} Province</span>
                          </div>
                          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#5A5A7A', lineHeight: 1.6, marginBottom: 14 }}>{provinceArc.desc}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#1A1A2E', fontWeight: 700 }}>{provinceArc.chapters} chapters</span>
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: provinceColor, fontWeight: 700 }}>Explore →</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ background: '#FDFAF5', padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${provinceColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗺️</div>
                        <div>
                          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#1A1A2E', fontWeight: 700 }}>{PROVINCE_LABELS[activeProvince]}</div>
                          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#5A5A7A', marginTop: 3 }}>Arcs coming soon</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-sg-muted" />
            <div
              className="scroll-dot h-6 w-1 rounded-full bg-sg-muted/50"
              style={{ animationDelay: '0.3s' }}
            />
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 3,
                color: 'var(--sg-muted)',
                textTransform: 'uppercase',
              }}
            >
              SCROLL
            </p>
          </div>
        </section>

        {/* ── TWO PATHS ──────────────────────────────────────────── */}
        <section style={{ background: 'var(--sg-bg-section)', paddingTop: 96, paddingBottom: 96 }}>
          <div className="container">
            <p
              className="reveal mb-4"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                letterSpacing: 5,
                color: 'var(--sg-primary)',
                textTransform: 'uppercase',
              }}
            >
              Choose your story
            </p>
            <h2
              className="reveal reveal-delay-1 mb-16"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                color: 'var(--sg-ink)',
                lineHeight: 1.1,
              }}
            >
              How do you want to
              <br />
              know this island?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">

              {/* Explorer card */}
              <a href="#how-it-works" style={{ textDecoration: 'none' }}>
                <div
                  className="path-card rounded-3xl p-10 relative overflow-hidden cursor-pointer h-full bg-white"
                  style={{
                    border: '1px solid rgba(26,107,122,0.22)',
                    boxShadow: 'var(--sg-shadow-card)',
                  }}
                >
                  <div className="float-pin text-5xl mb-6">🧭</div>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 32,
                      color: 'var(--sg-ink)',
                      marginBottom: 12,
                    }}
                  >
                    I&apos;m here to explore.
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 16,
                      color: 'var(--sg-muted)',
                      lineHeight: 1.7,
                      marginBottom: 28,
                    }}
                  >
                    Five worlds. Nine provinces. Hundreds of stories. One island that never runs out.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Story Arcs', 'Province Passport', 'Serendipity Coins'].map((p) => (
                      <span
                        key={p}
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: 1,
                          color: '#1A6B7A',
                          background: '#1A6B7A22',
                          border: '1px solid #1A6B7A44',
                          padding: '4px 12px',
                          borderRadius: 100,
                          textTransform: 'uppercase',
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <div
                    className="mt-8"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14,
                      color: 'var(--sg-primary)',
                      fontWeight: 600,
                    }}
                  >
                    Start exploring →
                  </div>
                </div>
              </a>

              {/* Partner card */}
              <Link href="/partners" style={{ textDecoration: 'none' }}>
                <div
                  className="path-card rounded-3xl p-10 relative overflow-hidden cursor-pointer h-full bg-white"
                  style={{
                    border: '1px solid rgba(45,110,78,0.25)',
                    boxShadow: 'var(--sg-shadow-card)',
                  }}
                >
                  <div className="float-pin text-5xl mb-6" style={{ animationDelay: '1.5s' }}>
                    🏠
                  </div>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 32,
                      color: 'var(--sg-ink)',
                      marginBottom: 12,
                    }}
                  >
                    I&apos;m part of this island.
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 16,
                      color: 'var(--sg-muted)',
                      lineHeight: 1.7,
                      marginBottom: 28,
                    }}
                  >
                    Bring curious travellers to your door. Join SerendiGO as a local partner —
                    your family&apos;s story deserves to be found.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Map Visibility', 'Coin Redemptions', 'Family-run Badge'].map((p) => (
                      <span
                        key={p}
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: 1,
                          color: '#2D6E4E',
                          background: '#2D6E4E22',
                          border: '1px solid #2D6E4E44',
                          padding: '4px 12px',
                          borderRadius: 100,
                          textTransform: 'uppercase',
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <div
                    className="mt-8"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14,
                      color: 'var(--sg-primary)',
                      fontWeight: 600,
                    }}
                  >
                    Partner with us →
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FIVE WORLDS / ARCS ─────────────────────────────────── */}
        <section
          id="how-it-works"
          style={{ background: 'var(--sg-bg-rich)', paddingTop: 96, paddingBottom: 96 }}
        >
          <div className="container">
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                letterSpacing: 5,
                color: 'var(--sg-primary)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              The five worlds
            </p>
            <h2
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                color: 'var(--sg-ink)',
                marginBottom: 48,
                maxWidth: 720,
              }}
            >
              Follow the story. Don&apos;t follow the crowd.
            </h2>

            <div className="flex flex-wrap justify-center gap-6">
              {ARCS.map((arc) => (
                <div
                  key={arc.world}
                  className="w-[min(100%,340px)] shrink-0"
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${arc.color}40`,
                    borderTop: `3px solid ${arc.color}`,
                    borderRadius: 20,
                    padding: 32,
                    boxShadow: 'var(--sg-shadow-card)',
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 16 }}>{arc.emoji}</div>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 11,
                      letterSpacing: 2,
                      color: arc.color,
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    {arc.world}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 24,
                      color: 'var(--sg-ink)',
                      marginTop: 8,
                      marginBottom: 8,
                      lineHeight: 1.2,
                    }}
                  >
                    {arc.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14,
                      color: 'var(--sg-ink)',
                      opacity: 0.6,
                      lineHeight: 1.6,
                      marginBottom: 20,
                    }}
                  >
                    {arc.desc}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 11,
                        color: 'var(--sg-ink)',
                        opacity: 0.4,
                        background: 'rgba(26,26,46,0.06)',
                        padding: '4px 10px',
                        borderRadius: 100,
                      }}
                    >
                      {arc.province}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 11,
                        color: arc.color,
                        fontWeight: 600,
                      }}
                    >
                      {arc.chapters} chapters
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GAMIFICATION LOOP ──────────────────────────────────── */}
        <section style={{ background: 'var(--sg-bg-deep)', paddingTop: 96, paddingBottom: 96 }}>
          <div className="container grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="reveal mb-4"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12,
                  letterSpacing: 5,
                  color: 'var(--sg-primary)',
                  textTransform: 'uppercase',
                }}
              >
                How it works
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
                Explore. Capture.
                <br />
                Earn. Spend. Repeat.
              </h2>
              <p
                className="reveal reveal-delay-2 mb-10"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 17,
                  color: 'var(--sg-ink)',
                  opacity: 0.68,
                  lineHeight: 1.75,
                }}
              >
                Every place has a chapter. Every chapter earns you Serendipity Coins. Every coin
                spends at a family-run restaurant, guesthouse, or guide just down the road. The
                island rewards the people who slow down to actually see it.
              </p>

              {/* Passport preview */}
              <div className="reveal reveal-delay-3">
                <p
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 11,
                    letterSpacing: 3,
                    color: 'var(--sg-muted)',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  Your Passport
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    maxWidth: 240,
                  }}
                >
                  {PROVINCES.map((p, i) => (
                    <div
                      key={p.id}
                      className="stamp"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: i < 5 ? `${p.worldColor}22` : 'rgba(26,26,46,0.04)',
                        border:
                          i < 5
                            ? `2px solid ${p.worldColor}`
                            : '2px dashed rgba(26,26,46,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: i < 5 ? p.worldColor : 'rgba(26,26,46,0.22)',
                          fontWeight: 700,
                          textAlign: 'center',
                          lineHeight: 1.2,
                          padding: 4,
                        }}
                      >
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Orbit diagram */}
            <div
              className="reveal flex items-center justify-center"
              style={{ minHeight: 360 }}
            >
              <div style={{ position: 'relative', width: 300, height: 300 }}>
                {/* Centre */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    textAlign: 'center',
                    zIndex: 2,
                  }}
                >
                  <div style={{ fontSize: 28 }}>🪙</div>
                  <div
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 14,
                      color: 'var(--sg-primary)',
                      marginTop: 4,
                    }}
                  >
                    Serendipity
                    <br />
                    Coins
                  </div>
                </div>
                {/* Orbit ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 20,
                    borderRadius: '50%',
                    border: '1px dashed rgba(29,125,200,0.22)',
                  }}
                />
                {/* Orbiting nodes */}
                {ORBIT_NODES.map((node) => {
                  const rad = ((node.angle - 90) * Math.PI) / 180
                  const r = 120
                  const cx = 150 + r * Math.cos(rad)
                  const cy = 150 + r * Math.sin(rad)
                  return (
                    <div
                      key={node.label}
                      style={{
                        position: 'absolute',
                        left: cx - 32,
                        top: cy - 32,
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'rgba(29,125,200,0.1)',
                        border: '1px solid rgba(29,125,200,0.28)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{node.emoji}</span>
                      <span
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 9,
                          color: 'var(--sg-primary)',
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                        }}
                      >
                        {node.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE HUMAN STORY ────────────────────────────────────── */}
        <section style={{ background: 'var(--sg-bg-base)', paddingTop: 96, paddingBottom: 96 }}>
          <div className="container grid md:grid-cols-5 gap-12 md:gap-16 items-center">
            <div className="md:col-span-3">
              <p
                className="reveal mb-5"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12,
                  letterSpacing: 5,
                  color: 'var(--sg-primary)',
                  textTransform: 'uppercase',
                }}
              >
                The heart of SerendiGO
              </p>
              <h2
                className="reveal reveal-delay-1 mb-10"
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  color: 'var(--sg-ink)',
                  lineHeight: 1.05,
                }}
              >
                Behind every meal,
                <br />
                <span className="sg-text-accent">there&apos;s a family.</span>
              </h2>
              <div
                className="reveal reveal-delay-2"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 17,
                  color: 'var(--sg-ink)',
                  opacity: 0.7,
                  lineHeight: 1.85,
                  maxWidth: 560,
                }}
              >
                <p style={{ marginBottom: 20 }}>
                  Sri Lanka&apos;s greatest hospitality has never come from hotel chains. It comes
                  from the kottu stall where Ravi&apos;s been flipping roti since 1994. From
                  Dilani&apos;s guesthouse in Ella where she grows her own vegetables and knows
                  every hiking trail. From Asanka&apos;s spice garden in Matale where the cinnamon
                  is cut fresh when you arrive.
                </p>
                <p>
                  These are the people we built this for. SerendiGO surfaces them first. Always.
                </p>
              </div>

              {/* Stats */}
              <div className="reveal reveal-delay-3 flex flex-wrap gap-12 mt-14">
                {[
                  { value: null, label: 'Local partners', ref: true },
                  { value: '9', label: 'Provinces' },
                  { value: '🏠', label: 'Family-run, always first' },
                ].map((s, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: 'DM Serif Display, serif',
                        fontSize: 52,
                        color: 'var(--sg-primary)',
                        lineHeight: 1,
                      }}
                    >
                      {s.ref ? <span ref={counterRef}>0+</span> : s.value}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 13,
                        color: 'var(--sg-ink)',
                        opacity: 0.5,
                        marginTop: 6,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner vignettes — right column; grid items-center vertically centers this vs copy */}
            <div className="md:col-span-2 mt-12 flex justify-center md:mt-0 md:justify-end">
              <div className="relative w-full max-w-[320px]" style={{ minHeight: 420 }}>
                {PARTNER_VIGNETTES.map((v, i) => {
                  const depth =
                    (i - partnerStackFront + PARTNER_VIGNETTES.length) % PARTNER_VIGNETTES.length
                  return (
                  <div
                    key={v.name}
                    className="reveal"
                    style={{
                      position: 'absolute',
                      top: depth * STACK_STEP_TOP,
                      right: depth * STACK_STEP_RIGHT,
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid var(--sg-border-subtle)',
                      borderRadius: 16,
                      padding: '20px 24px',
                      animationDelay: `${v.delay}s`,
                      zIndex: 10 - depth,
                      boxShadow: 'var(--sg-shadow-card)',
                      transition:
                        'top 0.65s cubic-bezier(0.33, 1, 0.68, 1), right 0.65s cubic-bezier(0.33, 1, 0.68, 1)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div
                        style={{
                          fontFamily: 'DM Serif Display, serif',
                          fontSize: 18,
                          color: 'var(--sg-ink)',
                          lineHeight: 1.25,
                        }}
                      >
                        {v.name}
                      </div>
                      {v.familyRun ? (
                        <span
                          style={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontSize: 10,
                            letterSpacing: 1,
                            background: 'rgba(29, 125, 200, 0.12)',
                            color: 'var(--sg-primary)',
                            border: '1px solid rgba(29, 125, 200, 0.28)',
                            padding: '3px 10px',
                            borderRadius: 100,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          🏠 Family run
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 11,
                          color: '#1A6B7A',
                          background: '#1A6B7A22',
                          padding: '3px 10px',
                          borderRadius: 100,
                        }}
                      >
                        {v.type}
                      </span>
                      <span
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 11,
                          color: 'var(--sg-muted)',
                        }}
                      >
                        {v.province}
                      </span>
                      <span style={{ color: 'var(--sg-primary)', fontSize: 11 }}>★★★★★</span>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOR PARTNERS ───────────────────────────────────────── */}
        <section id="partners" style={{ background: 'var(--sg-bg-partner)', paddingTop: 96, paddingBottom: 96 }}>
          <div className="container">
            <p
              className="reveal mb-4"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                letterSpacing: 5,
                color: 'var(--sg-primary)',
                textTransform: 'uppercase',
              }}
            >
              For local businesses
            </p>
            <h2
              className="reveal reveal-delay-1 mb-5"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                color: 'var(--sg-ink)',
                lineHeight: 1.1,
                maxWidth: 640,
              }}
            >
              Grow with the people
              <br />
              who travel with purpose.
            </h2>
            <p
              className="reveal reveal-delay-2 mb-16"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 17,
                color: 'var(--sg-ink)',
                opacity: 0.65,
                lineHeight: 1.7,
                maxWidth: 520,
              }}
            >
              These aren&apos;t package tourists. They&apos;re curious, intentional travellers —
              and they&apos;re already spending coins to find you.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-14">
              {[
                {
                  icon: '🗺️',
                  title: 'Visibility on the map',
                  body: 'Your business pinned on the island map. Featured in story arcs. Zero algorithm games — curated by hand.',
                },
                {
                  icon: '🪙',
                  title: 'QR Coin Redemptions',
                  body: 'Accept Serendipity Coins as real discounts. We send you a printed QR. One dashboard. Zero complexity.',
                },
                {
                  icon: '🏠',
                  title: 'Family-run badge',
                  body: 'Independently owned? We label you and sort you above chains in every list. Because small should always come first.',
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="reveal"
                  style={{
                    background: 'var(--sg-bg-elevated)',
                    border: '1px solid var(--sg-border-subtle)',
                    borderRadius: 20,
                    padding: 28,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{b.icon}</div>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 22,
                      color: 'var(--sg-ink)',
                      marginBottom: 10,
                    }}
                  >
                    {b.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14,
                      color: 'var(--sg-ink)',
                      opacity: 0.6,
                      lineHeight: 1.7,
                    }}
                  >
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="reveal text-center md:text-left">
              <Link
                href="/partners"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  background: 'var(--sg-primary)',
                  color: '#ffffff',
                  padding: '16px 40px',
                  borderRadius: 100,
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: 'var(--sg-glow-amber)',
                }}
                className="hover:brightness-[1.03] transition-[filter]"
              >
                Become a Partner →
              </Link>
            </div>
          </div>
        </section>

        {/* ── CREATORS ───────────────────────────────────────────── */}
        <section id="creators" style={{ background: '#fff', paddingTop: 96, paddingBottom: 96 }}>
          <div className="container">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* LEFT */}
              <div>
                <p
                  className="reveal mb-4"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 12,
                    letterSpacing: 5,
                    color: 'var(--sg-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  For writers &amp; photographers
                </p>
                <h2
                  className="reveal reveal-delay-1 mb-5"
                  style={{
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: 'clamp(28px, 3.5vw, 48px)',
                    color: 'var(--sg-ink)',
                    lineHeight: 1.1,
                  }}
                >
                  Write stories that send people
                  <br />
                  <span className="sg-text-accent">into your motherland.</span>
                </h2>
                <p
                  className="reveal reveal-delay-2 mb-8"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 17,
                    color: 'var(--sg-ink)',
                    opacity: 0.65,
                    lineHeight: 1.7,
                    maxWidth: 520,
                  }}
                >
                  SerendiGO publishes story arcs by photographers, food writers,
                  naturalists, and locals who know one corner of this island deeply.
                  Apply once — your arc carries your name and link in the app.
                </p>
                <div className="reveal reveal-delay-3 flex flex-wrap gap-4">
                  <Link
                    href="/creators"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: 16,
                      background: 'var(--sg-primary)',
                      color: '#ffffff',
                      padding: '16px 40px',
                      borderRadius: 100,
                      textDecoration: 'none',
                      display: 'inline-block',
                      boxShadow: 'var(--sg-glow-accent)',
                    }}
                    className="hover:brightness-[1.03] transition-[filter]"
                  >
                    Apply to create →
                  </Link>
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
                      display: 'inline-block',
                    }}
                    className="hover:bg-sg-section transition-colors"
                  >
                    Creator login
                  </Link>
                </div>
              </div>

              {/* RIGHT — three feature cards */}
              <div className="flex flex-col gap-5">
                {[
                  {
                    icon: '✍️',
                    title: 'Curated, not crowdsourced',
                    body: 'We review every arc before it goes live. That means your work sits next to quality — not noise.',
                  },
                  {
                    icon: '✨',
                    title: 'AI polish built in',
                    body: 'Write your lore and narrative hooks. Our AI editor helps match tone and length — you stay in control.',
                  },
                  {
                    icon: '📍',
                    title: 'Your name on every chapter',
                    body: 'Approved arcs carry your photo, bio, and link on every chapter in the mobile app. Real attribution.',
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="reveal"
                    style={{
                      display: 'flex',
                      gap: 16,
                      alignItems: 'flex-start',
                      background: 'var(--sg-bg-section)',
                      border: '1px solid var(--sg-border-subtle)',
                      borderRadius: 20,
                      padding: '20px 24px',
                    }}
                  >
                    <span style={{ fontSize: 28, lineHeight: 1, marginTop: 2 }}>{card.icon}</span>
                    <div>
                      <h3
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'var(--sg-ink)',
                          marginBottom: 6,
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 14,
                          color: 'var(--sg-ink)',
                          opacity: 0.6,
                          lineHeight: 1.65,
                        }}
                      >
                        {card.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD ───────────────────────────────────────────── */}
        <section
          className="text-center"
          style={{ background: 'linear-gradient(to bottom, var(--sg-bg-base) 0%, var(--sg-bg-partner) 100%)', paddingTop: 96, paddingBottom: 96 }}
        >
          <div className="container" style={{ maxWidth: 768, margin: '0 auto', padding: '0 48px' }}>
            {/* Island with all provinces lit */}
            <div className="flex justify-center mb-10">
              <SriLankaMap allLit width={160} height={282} style={{ filter: 'drop-shadow(0 0 28px rgba(29,125,200,0.35))' }} />
            </div>
            <h2
              className="reveal mb-5"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                color: 'var(--sg-ink)',
                lineHeight: 1.05,
              }}
            >
              The island is ready.
              <br />
              <span className="sg-text-accent">Are you?</span>
            </h2>
            <p
              className="reveal reveal-delay-1 mb-10"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 17,
                color: 'var(--sg-ink)',
                opacity: 0.6,
                lineHeight: 1.7,
              }}
            >
              Free to download. iOS and Android. Launching 2026.
            </p>
            <div className="reveal reveal-delay-2 flex flex-wrap justify-center gap-4 mb-6">
              {[
                { icon: '📱', label: 'App Store' },
                { icon: '🤖', label: 'Google Play' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    background: '#ffffff',
                    color: 'var(--sg-ink)',
                    border: '1px solid var(--sg-border-strong)',
                    padding: '14px 28px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  className="hover:bg-sg-section transition-colors"
                >
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
            <p
              className="reveal reveal-delay-3"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                color: 'var(--sg-muted)',
                letterSpacing: 2,
              }}
            >
              CURRENTLY IN BETA
            </p>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
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
              {[
                { label: 'For Explorers', href: '#for-explorers' },
                { label: 'For Partners', href: '/partners' },
                { label: 'For Creators', href: '/creators' },
                { label: 'Download', href: '#download' },
                { label: 'About', href: '#' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="block mb-3"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 14,
                    color: 'var(--sg-muted)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sg-ink)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'var(--sg-muted)')
                  }
                >
                  {label}
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
                  color: 'var(--sg-primary)',
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
