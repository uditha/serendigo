'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ── Sri Lanka simplified province data ─────────────────────────────── */
const PROVINCES = [
  { id: 'western',       label: 'Western',     cx: 72,  cy: 168, r: 18, worldColor: '#B85C1A' },
  { id: 'central',       label: 'Central',     cx: 105, cy: 148, r: 16, worldColor: '#2D6E4E' },
  { id: 'southern',      label: 'Southern',    cx: 88,  cy: 200, r: 16, worldColor: '#E8832A' },
  { id: 'northern',      label: 'Northern',    cx: 100, cy: 50,  r: 20, worldColor: '#614A9E' },
  { id: 'eastern',       label: 'Eastern',     cx: 145, cy: 130, r: 16, worldColor: '#1A5F8A' },
  { id: 'north_western', label: 'NW',          cx: 68,  cy: 110, r: 14, worldColor: '#5E8C6E' },
  { id: 'north_central', label: 'NC',          cx: 105, cy: 105, r: 16, worldColor: '#8E44AD' },
  { id: 'uva',           label: 'Uva',         cx: 125, cy: 170, r: 14, worldColor: '#E8832A' },
  { id: 'sabaragamuwa',  label: 'Sabaragamuwa', cx: 92, cy: 172, r: 13, worldColor: '#2D6E4E' },
]

const ARCS = [
  { world: 'TASTE',   emoji: '🍛', color: '#B85C1A', title: 'The Colombo Street Food Circuit',  province: 'Western',      chapters: 6, desc: 'From Pettah to Slave Island. The real city, eaten slowly.' },
  { world: 'WILD',    emoji: '🌿', color: '#2D6E4E', title: 'The Elephant Circuit',              province: 'North Central', chapters: 5, desc: 'Minneriya, Kaudulla, Hurulu. Three parks, one ancient migration.' },
  { world: 'MOVE',    emoji: '⚡', color: '#1A5F8A', title: 'The Great Train Journey',           province: 'Central',      chapters: 7, desc: 'Colombo Fort to Badulla. Nine hours. A thousand views.' },
  { world: 'ROOTS',   emoji: '🏛️', color: '#614A9E', title: 'The Ancient Kingdoms',              province: 'Northern',     chapters: 8, desc: 'Anuradhapura to Polonnaruwa. Kingdoms under the banyan.' },
  { world: 'RESTORE', emoji: '🧘', color: '#5E8C6E', title: 'Ayurveda & the Hill Country',       province: 'Uva',          chapters: 5, desc: 'Nuwara Eliya to Haputale. Rest was never this earned.' },
]

const ORBIT_NODES = [
  { angle: 0,   emoji: '🗺️', label: 'Explore' },
  { angle: 90,  emoji: '📸', label: 'Capture' },
  { angle: 180, emoji: '🪙', label: 'Earn' },
  { angle: 270, emoji: '🏠', label: 'Spend' },
]

export default function Home() {
  const [activeProvinces, setActiveProvinces] = useState<string[]>([])
  const [preloaderDone, setPreloaderDone] = useState(false)
  const arcSectionRef = useRef<HTMLDivElement>(null)
  const arcTrackRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const counterDone = useRef(false)

  /* Preloader */
  useEffect(() => {
    const t = setTimeout(() => setPreloaderDone(true), 2000)
    return () => clearTimeout(t)
  }, [])

  /* Stars */
  useEffect(() => {
    const container = document.getElementById('star-field')
    if (!container) return
    for (let i = 0; i < 70; i++) {
      const star = document.createElement('div')
      star.className = 'star'
      star.style.cssText = `
        width: ${Math.random() * 2.5 + 0.5}px;
        height: ${Math.random() * 2.5 + 0.5}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        --dur: ${Math.random() * 3 + 2}s;
        --delay: ${Math.random() * 4}s;
        opacity: ${Math.random() * 0.5 + 0.1};
      `
      container.appendChild(star)
    }
  }, [])

  /* Scroll — sky interpolation + horizontal arc scroll + province map */
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t))

    const handler = () => {
      const y = window.scrollY
      const max = document.body.scrollHeight - window.innerHeight

      // Sky gradient interpolation (pre-dawn → golden → teal → night)
      const p = y / max
      let r: number, g: number, b: number
      if (p < 0.3) {
        const t = p / 0.3
        r = lerp(13, 26, t); g = lerp(11, 107, t); b = lerp(24, 122, t)
      } else if (p < 0.6) {
        const t = (p - 0.3) / 0.3
        r = lerp(26, 26, t); g = lerp(107, 26, t); b = lerp(122, 46, t)
      } else {
        const t = (p - 0.6) / 0.4
        r = lerp(26, 10, t); g = lerp(26, 8, t); b = lerp(46, 20, t)
      }
      document.documentElement.style.setProperty('--sky', `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`)

      // Horizontal arc scroll
      const arcSection = arcSectionRef.current
      const arcTrack = arcTrackRef.current
      if (arcSection && arcTrack) {
        const rect = arcSection.getBoundingClientRect()
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
          const progress = Math.abs(rect.top) / (arcSection.offsetHeight - window.innerHeight)
          const maxX = arcTrack.scrollWidth - arcTrack.clientWidth
          arcTrack.style.transform = `translateX(${-maxX * Math.min(1, progress)}px)`
        }
      }

      // Province map: highlight based on scroll position through arc section
      const arcProgress = arcSection
        ? Math.abs(arcSection.getBoundingClientRect().top) / (arcSection.offsetHeight || 1)
        : 0
      const arcIdx = Math.floor(arcProgress * ARCS.length)
      const arc = ARCS[Math.min(arcIdx, ARCS.length - 1)]
      setActiveProvinces(arc ? [arc.province.toLowerCase().replace(/\s/g, '_')] : [])
    }

    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
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
          <svg width="120" height="150" viewBox="0 0 200 250" fill="none">
            <path
              d="M100,12 C115,8 132,14 143,28 C158,46 164,70 163,96 C162,122 154,146 142,167 C130,188 114,205 96,216 C78,227 58,228 42,216 C26,204 18,184 16,162 C14,140 20,118 30,98 C40,78 54,62 64,46 C74,30 80,18 100,12 Z"
              stroke="#E8832A"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
          <div
            style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: 28,
              color: '#F7F0E3',
              letterSpacing: 2,
            }}
          >
            SerendiGO
          </div>
        </div>
      </div>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'rgba(13,11,24,0.7)', backdropFilter: 'blur(12px)' }}
      >
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#F7F0E3' }}>
          SerendiGO <span style={{ color: '#E8832A' }}>🌴</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['For Explorers', 'How It Works', 'Blog'].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, '-')}`}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 14,
                color: '#F7F0E3',
                opacity: 0.75,
              }}
              className="hover:opacity-100 transition-opacity"
            >
              {l}
            </a>
          ))}
          <Link
            href="/partners"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 14,
              background: '#1A6B7A',
              color: '#F7F0E3',
              padding: '8px 20px',
              borderRadius: 100,
            }}
            className="hover:opacity-90 transition-opacity"
          >
            For Partners
          </Link>
        </div>
      </nav>

      <main className="relative">

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden"
          id="for-explorers"
          style={{ background: 'linear-gradient(to bottom, #0D0B18 0%, #0D2B38 100%)' }}
        >
          {/* Stars */}
          <div id="star-field" className="absolute inset-0 pointer-events-none" />

          {/* Island watermark */}
          <div className="absolute right-0 top-0 bottom-0 hidden lg:flex items-center pr-16 opacity-10 pointer-events-none">
            <svg width="220" height="280" viewBox="0 0 200 250" fill="none">
              <path
                d="M100,12 C115,8 132,14 143,28 C158,46 164,70 163,96 C162,122 154,146 142,167 C130,188 114,205 96,216 C78,227 58,228 42,216 C26,204 18,184 16,162 C14,140 20,118 30,98 C40,78 54,62 64,46 C74,30 80,18 100,12 Z"
                fill="#F7F0E3"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 md:px-20 max-w-4xl pt-32 pb-20">
            <p
              className="mb-6"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                letterSpacing: 5,
                color: '#E8832A',
                textTransform: 'uppercase',
              }}
            >
              The Living Guide to Sri Lanka
            </p>
            <h1
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(52px, 8vw, 96px)',
                color: '#F7F0E3',
                lineHeight: 1.05,
                marginBottom: 28,
              }}
            >
              Before you know it,
              <br />
              <span style={{ color: '#E8832A' }}>you&apos;ll miss it.</span>
            </h1>
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(16px, 2vw, 20px)',
                color: '#F7F0E3',
                opacity: 0.72,
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
                className="pulse-cta"
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
                Begin the journey
              </a>
              <Link
                href="/partners"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 15,
                  color: '#F7F0E3',
                  opacity: 0.7,
                  padding: '14px 24px',
                  border: '1px solid rgba(247,240,227,0.25)',
                  borderRadius: 100,
                  textDecoration: 'none',
                }}
                className="hover:opacity-100 transition-opacity"
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
                    background: `${w.color}22`,
                    color: w.color,
                    border: `1px solid ${w.color}44`,
                    padding: '6px 14px',
                    borderRadius: 100,
                  }}
                >
                  {w.emoji} {w.label}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <div
              className="scroll-dot w-1 h-1 rounded-full"
              style={{ background: '#F7F0E3', opacity: 0.4 }}
            />
            <div
              className="scroll-dot w-1 h-6 rounded-full"
              style={{ background: '#F7F0E3', opacity: 0.2, animationDelay: '0.3s' }}
            />
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 10,
                letterSpacing: 4,
                color: '#F7F0E3',
                opacity: 0.35,
                textTransform: 'uppercase',
              }}
            >
              SCROLL
            </p>
          </div>
        </section>

        {/* ── TWO PATHS ──────────────────────────────────────────── */}
        <section className="py-24 px-8 md:px-20" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div className="max-w-6xl mx-auto">
            <p
              className="reveal mb-4"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                letterSpacing: 5,
                color: '#E8832A',
                textTransform: 'uppercase',
              }}
            >
              Choose your story
            </p>
            <h2
              className="reveal reveal-delay-1 mb-16"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(36px, 5vw, 60px)',
                color: '#F7F0E3',
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
                  className="path-card rounded-3xl p-10 relative overflow-hidden cursor-pointer h-full"
                  style={{
                    background: 'linear-gradient(135deg, #0D2B38 0%, #1A3D4A 100%)',
                    border: '1px solid rgba(26,107,122,0.3)',
                  }}
                >
                  <div className="float-pin text-5xl mb-6">🧭</div>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 32,
                      color: '#F7F0E3',
                      marginBottom: 12,
                    }}
                  >
                    I&apos;m here to explore.
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 16,
                      color: '#F7F0E3',
                      opacity: 0.65,
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
                      color: '#E8832A',
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
                  className="path-card rounded-3xl p-10 relative overflow-hidden cursor-pointer h-full"
                  style={{
                    background: 'linear-gradient(135deg, #1A3322 0%, #1F3D2A 100%)',
                    border: '1px solid rgba(45,110,78,0.3)',
                  }}
                >
                  <div className="float-pin text-5xl mb-6" style={{ animationDelay: '1.5s' }}>
                    🏠
                  </div>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 32,
                      color: '#F7F0E3',
                      marginBottom: 12,
                    }}
                  >
                    I&apos;m part of this island.
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 16,
                      color: '#F7F0E3',
                      opacity: 0.65,
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
                      color: '#E8832A',
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

        {/* ── HORIZONTAL ARC SCROLL ──────────────────────────────── */}
        <div ref={arcSectionRef} id="how-it-works" style={{ height: '400vh', position: 'relative' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Fixed island map — desktop */}
            <div
              className="hidden xl:block"
              style={{
                position: 'fixed',
                right: 48,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 180,
                zIndex: 10,
              }}
            >
              <svg width="180" height="230" viewBox="0 0 200 250" fill="none">
                {/* Island outline */}
                <path
                  d="M100,12 C115,8 132,14 143,28 C158,46 164,70 163,96 C162,122 154,146 142,167 C130,188 114,205 96,216 C78,227 58,228 42,216 C26,204 18,184 16,162 C14,140 20,118 30,98 C40,78 54,62 64,46 C74,30 80,18 100,12 Z"
                  stroke="rgba(247,240,227,0.2)"
                  strokeWidth="1.5"
                  fill="rgba(247,240,227,0.03)"
                />
                {/* Province dots */}
                {PROVINCES.map((p) => (
                  <circle
                    key={p.id}
                    cx={p.cx}
                    cy={p.cy}
                    r={p.r * 0.5}
                    fill={
                      activeProvinces.includes(p.id)
                        ? p.worldColor
                        : 'rgba(247,240,227,0.15)'
                    }
                    className="province-region"
                    style={{
                      filter: activeProvinces.includes(p.id)
                        ? `drop-shadow(0 0 6px ${p.worldColor})`
                        : 'none',
                      transition: 'all 0.5s ease',
                    }}
                  />
                ))}
              </svg>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 10,
                  letterSpacing: 3,
                  color: 'rgba(247,240,227,0.3)',
                  textAlign: 'center',
                  marginTop: 8,
                  textTransform: 'uppercase',
                }}
              >
                The Island
              </p>
            </div>

            <div className="px-8 md:px-20 mb-8">
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12,
                  letterSpacing: 5,
                  color: '#E8832A',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                The five worlds
              </p>
              <h2
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  color: '#F7F0E3',
                }}
              >
                Follow the story. Don&apos;t follow the crowd.
              </h2>
            </div>

            {/* Horizontal track */}
            <div style={{ overflow: 'hidden', paddingLeft: '8vw' }}>
              <div
                ref={arcTrackRef}
                id="arc-track"
                style={{ display: 'flex', gap: 24, width: 'max-content', paddingRight: '8vw' }}
              >
                {ARCS.map((arc) => (
                  <div
                    key={arc.world}
                    style={{
                      width: 340,
                      flexShrink: 0,
                      background: 'rgba(247,240,227,0.04)',
                      border: `1px solid ${arc.color}33`,
                      borderTop: `3px solid ${arc.color}`,
                      borderRadius: 20,
                      padding: 32,
                      backdropFilter: 'blur(8px)',
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
                        color: '#F7F0E3',
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
                        color: '#F7F0E3',
                        opacity: 0.6,
                        lineHeight: 1.6,
                        marginBottom: 20,
                      }}
                    >
                      {arc.desc}
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 11,
                          color: '#F7F0E3',
                          opacity: 0.4,
                          background: 'rgba(247,240,227,0.06)',
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
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                color: 'rgba(247,240,227,0.3)',
                paddingLeft: '8vw',
                marginTop: 16,
                letterSpacing: 2,
              }}
            >
              ← SCROLL TO EXPLORE →
            </p>
          </div>
        </div>

        {/* ── GAMIFICATION LOOP ──────────────────────────────────── */}
        <section className="py-28 px-8 md:px-20" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="reveal mb-4"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12,
                  letterSpacing: 5,
                  color: '#E8832A',
                  textTransform: 'uppercase',
                }}
              >
                How it works
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
                Explore. Capture.
                <br />
                Earn. Spend. Repeat.
              </h2>
              <p
                className="reveal reveal-delay-2 mb-10"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 17,
                  color: '#F7F0E3',
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
                    color: 'rgba(247,240,227,0.4)',
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
                        background: i < 5 ? `${p.worldColor}33` : 'rgba(247,240,227,0.04)',
                        border:
                          i < 5
                            ? `2px solid ${p.worldColor}`
                            : '2px dashed rgba(247,240,227,0.15)',
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
                          color: i < 5 ? p.worldColor : 'rgba(247,240,227,0.2)',
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
                      color: '#E8832A',
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
                    border: '1px dashed rgba(232,131,42,0.2)',
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
                        background: 'rgba(232,131,42,0.1)',
                        border: '1px solid rgba(232,131,42,0.3)',
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
                          color: '#E8832A',
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
        <section className="py-28 px-8 md:px-20" style={{ background: '#0D0B18' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-16 items-start">
              <div className="md:col-span-3">
                <p
                  className="reveal mb-5"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 12,
                    letterSpacing: 5,
                    color: '#E8832A',
                    textTransform: 'uppercase',
                  }}
                >
                  The heart of SerendiGO
                </p>
                <h2
                  className="reveal reveal-delay-1 mb-10"
                  style={{
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: 'clamp(36px, 5vw, 64px)',
                    color: '#F7F0E3',
                    lineHeight: 1.05,
                  }}
                >
                  Behind every meal,
                  <br />
                  <span style={{ color: '#E8832A' }}>there&apos;s a family.</span>
                </h2>
                <div
                  className="reveal reveal-delay-2"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 17,
                    color: '#F7F0E3',
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
                          color: '#E8832A',
                          lineHeight: 1,
                        }}
                      >
                        {s.ref ? <span ref={counterRef}>0+</span> : s.value}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 13,
                          color: '#F7F0E3',
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

              {/* Partner vignettes */}
              <div className="md:col-span-2 relative" style={{ minHeight: 360 }}>
                {[
                  { name: "Ravi's Kottu Corner",  type: 'FOOD',       province: 'Western', delay: 0 },
                  { name: "Dilani's Ella Nest",   type: 'STAY',       province: 'Uva',     delay: 0.15 },
                  { name: 'Asanka Spice Garden',  type: 'EXPERIENCE', province: 'Central', delay: 0.3 },
                ].map((v, i) => (
                  <div
                    key={v.name}
                    className="reveal"
                    style={{
                      position: i === 0 ? 'relative' : 'absolute',
                      top: i === 0 ? 0 : `${i * 52}px`,
                      right: i === 0 ? 0 : `${i * 16}px`,
                      width: '100%',
                      background: '#0D2B38',
                      border: '1px solid rgba(26,107,122,0.3)',
                      borderRadius: 16,
                      padding: '20px 24px',
                      animationDelay: `${v.delay}s`,
                      zIndex: 3 - i,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        style={{
                          fontFamily: 'DM Serif Display, serif',
                          fontSize: 18,
                          color: '#F7F0E3',
                        }}
                      >
                        {v.name}
                      </div>
                      <span
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 10,
                          letterSpacing: 1,
                          background: '#E8832A22',
                          color: '#E8832A',
                          border: '1px solid #E8832A44',
                          padding: '3px 10px',
                          borderRadius: 100,
                          whiteSpace: 'nowrap',
                          marginLeft: 8,
                        }}
                      >
                        🏠 Family run
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
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
                          color: 'rgba(247,240,227,0.4)',
                        }}
                      >
                        {v.province}
                      </span>
                      <span style={{ color: '#E8832A', fontSize: 11 }}>★★★★★</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOR PARTNERS ───────────────────────────────────────── */}
        <section className="py-28 px-8 md:px-20" style={{ background: '#0D2B38' }} id="partners">
          <div className="max-w-6xl mx-auto">
            <p
              className="reveal mb-4"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12,
                letterSpacing: 5,
                color: '#E8832A',
                textTransform: 'uppercase',
              }}
            >
              For local businesses
            </p>
            <h2
              className="reveal reveal-delay-1 mb-5"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(32px, 4vw, 56px)',
                color: '#F7F0E3',
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
                color: '#F7F0E3',
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
                    background: 'rgba(13,11,24,0.6)',
                    border: '1px solid rgba(247,240,227,0.08)',
                    borderRadius: 20,
                    padding: 28,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{b.icon}</div>
                  <h3
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      fontSize: 22,
                      color: '#F7F0E3',
                      marginBottom: 10,
                    }}
                  >
                    {b.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14,
                      color: '#F7F0E3',
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
                  background: '#E8832A',
                  color: '#fff',
                  padding: '16px 40px',
                  borderRadius: 100,
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
                className="hover:opacity-90 transition-opacity pulse-cta"
              >
                Become a Partner →
              </Link>
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD ───────────────────────────────────────────── */}
        <section
          className="py-28 px-8 md:px-20 text-center"
          style={{ background: 'linear-gradient(to bottom, #0D0B18 0%, #0D2B38 100%)' }}
        >
          <div className="max-w-3xl mx-auto">
            {/* Island with all provinces lit */}
            <div className="flex justify-center mb-10 opacity-40">
              <svg width="120" height="150" viewBox="0 0 200 250" fill="none">
                <path
                  d="M100,12 C115,8 132,14 143,28 C158,46 164,70 163,96 C162,122 154,146 142,167 C130,188 114,205 96,216 C78,227 58,228 42,216 C26,204 18,184 16,162 C14,140 20,118 30,98 C40,78 54,62 64,46 C74,30 80,18 100,12 Z"
                  fill="#E8832A"
                  opacity="0.6"
                />
                {PROVINCES.map((p) => (
                  <circle
                    key={p.id}
                    cx={p.cx * 0.95}
                    cy={p.cy * 0.95}
                    r={3}
                    fill="#F7F0E3"
                    opacity="0.8"
                  />
                ))}
              </svg>
            </div>
            <h2
              className="reveal mb-5"
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(40px, 6vw, 72px)',
                color: '#F7F0E3',
                lineHeight: 1.05,
              }}
            >
              The island is ready.
              <br />
              <span style={{ color: '#E8832A' }}>Are you?</span>
            </h2>
            <p
              className="reveal reveal-delay-1 mb-10"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 17,
                color: '#F7F0E3',
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
                    background: 'rgba(247,240,227,0.08)',
                    color: '#F7F0E3',
                    border: '1px solid rgba(247,240,227,0.2)',
                    padding: '14px 28px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  className="hover:bg-white/10 transition-colors"
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
                color: 'rgba(247,240,227,0.3)',
                letterSpacing: 2,
              }}
            >
              CURRENTLY IN BETA
            </p>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
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
                <a
                  key={l}
                  href="#"
                  className="block mb-3"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 14,
                    color: 'rgba(247,240,227,0.55)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F0E3')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'rgba(247,240,227,0.55)')
                  }
                >
                  {l}
                </a>
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
