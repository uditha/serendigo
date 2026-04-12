'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main>
      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl text-dark flex items-center gap-2">
            SerendiGO <span>🌴</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#experience" className="font-sans text-sm text-dark/70 hover:text-dark transition-colors hidden md:inline">
              For Explorers
            </a>
            <a href="#partners" className="font-sans text-sm text-dark/70 hover:text-dark transition-colors hidden md:inline">
              How It Works
            </a>
            <Link
              href="/partners"
              className="font-sans text-sm px-4 py-2 rounded-full text-white transition-colors"
              style={{ backgroundColor: '#1A6B7A' }}
            >
              For Partners
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 1 — HERO */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #0D3D47 50%, #1A6B7A 100%)' }}
      >
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #E8832A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1A6B7A 0%, transparent 40%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p
            className="font-sans text-xs tracking-widest uppercase mb-8 opacity-70"
            style={{ color: '#E8832A' }}
          >
            The living guide to Sri Lanka
          </p>

          <h1 className="font-serif text-6xl md:text-8xl leading-tight mb-6" style={{ color: '#F7F0E3' }}>
            Sri Lanka.<br />
            Rediscovered.
          </h1>

          <p className="font-sans text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: '#F7F0E3', opacity: 0.8 }}>
            Not a tourist trail. A living story — told through food, wilderness, history,
            and the families who call this island home.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="#experience"
              className="font-sans font-semibold px-8 py-4 rounded-full text-white text-sm tracking-wide transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#E8832A' }}
            >
              Start Exploring
            </a>
            <Link
              href="/partners"
              className="font-sans text-sm px-8 py-4 rounded-full border transition-colors hover:bg-white/10"
              style={{ color: '#F7F0E3', borderColor: 'rgba(247,240,227,0.4)' }}
            >
              For Local Businesses →
            </Link>
          </div>

          {/* World type pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Taste', emoji: '🍛', color: '#B85C1A', bg: 'rgba(184,92,26,0.18)' },
              { label: 'Wild', emoji: '🌿', color: '#2D6E4E', bg: 'rgba(45,110,78,0.18)' },
              { label: 'Move', emoji: '⚡', color: '#1A5F8A', bg: 'rgba(26,95,138,0.18)' },
              { label: 'Roots', emoji: '🏛️', color: '#614A9E', bg: 'rgba(97,74,158,0.18)' },
              { label: 'Restore', emoji: '🧘', color: '#5E8C6E', bg: 'rgba(94,140,110,0.18)' },
            ].map((world) => (
              <span
                key={world.label}
                className="font-sans text-sm px-4 py-2 rounded-full border flex items-center gap-2"
                style={{
                  color: world.color,
                  borderColor: world.color,
                  backgroundColor: world.bg,
                }}
              >
                <span>{world.emoji}</span>
                {world.label}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-sans text-xs tracking-widest uppercase" style={{ color: '#F7F0E3' }}>Scroll</span>
          <div className="w-px h-8 bg-white/50" />
        </div>
      </section>

      {/* SECTION 2 — THE EXPERIENCE */}
      <section id="experience" className="py-24 px-6" style={{ backgroundColor: '#F7F0E3' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-sans text-xs tracking-widest uppercase mb-4" style={{ color: '#E8832A' }}>
              For explorers
            </p>
            <h2 className="font-serif text-4xl md:text-5xl" style={{ color: '#1A1A2E' }}>
              A new way to travel.
            </h2>
            <p className="font-sans text-base mt-4 max-w-xl mx-auto" style={{ color: '#5A5A7A' }}>
              SerendiGO turns Sri Lanka into a living story — one you step into, not observe from a bus window.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <article className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
              <div className="text-4xl mb-6">🗺️</div>
              <h3 className="font-serif text-2xl mb-4" style={{ color: '#1A1A2E' }}>
                Follow the story
              </h3>
              <p className="font-sans text-sm leading-relaxed" style={{ color: '#5A5A7A' }}>
                Every place has a chapter. Unlock arcs across 9 provinces — street food trails in Colombo,
                ancient kingdoms in Anuradhapura, tea routes through the Central Highlands. Each one a guided
                adventure, not a checklist.
              </p>
              <div className="mt-6 pt-6 border-t border-black/5">
                <span
                  className="font-sans text-xs tracking-wide uppercase font-semibold px-3 py-1 rounded-full"
                  style={{ color: '#1A5F8A', backgroundColor: 'rgba(26,95,138,0.1)' }}
                >
                  Story Arcs
                </span>
              </div>
            </article>

            {/* Card 2 */}
            <article className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
              <div className="text-4xl mb-6">📸</div>
              <h3 className="font-serif text-2xl mb-4" style={{ color: '#1A1A2E' }}>
                Stamp your journey
              </h3>
              <p className="font-sans text-sm leading-relaxed" style={{ color: '#5A5A7A' }}>
                Photograph each chapter to claim it. Watch your Passport fill — 9 provincial stamps, each
                earned through real presence. Not a screenshot. Not a pin on a map. Your story, written in places.
              </p>
              <div className="mt-6 pt-6 border-t border-black/5">
                <span
                  className="font-sans text-xs tracking-wide uppercase font-semibold px-3 py-1 rounded-full"
                  style={{ color: '#614A9E', backgroundColor: 'rgba(97,74,158,0.1)' }}
                >
                  Province Passport
                </span>
              </div>
            </article>

            {/* Card 3 */}
            <article className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
              <div className="text-4xl mb-6">🪙</div>
              <h3 className="font-serif text-2xl mb-4" style={{ color: '#1A1A2E' }}>
                Earn while you explore
              </h3>
              <p className="font-sans text-sm leading-relaxed" style={{ color: '#5A5A7A' }}>
                Every capture earns Serendipity Coins. Spend them for real discounts at local restaurants,
                guesthouses, and experiences. The more you explore, the more you give back — directly to the
                people who make this island remarkable.
              </p>
              <div className="mt-6 pt-6 border-t border-black/5">
                <span
                  className="font-sans text-xs tracking-wide uppercase font-semibold px-3 py-1 rounded-full"
                  style={{ color: '#B85C1A', backgroundColor: 'rgba(184,92,26,0.1)' }}
                >
                  Serendipity Coins
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION 3 — SUPPORT LOCAL */}
      <section className="py-24 px-6" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="font-sans text-xs tracking-widest uppercase mb-6" style={{ color: '#E8832A' }}>
              The heart of SerendiGO
            </p>
            <h2 className="font-serif text-4xl md:text-6xl leading-tight mb-10" style={{ color: '#F7F0E3' }}>
              Behind every meal,<br />
              there&apos;s a family.
            </h2>
            <p className="font-sans text-base leading-relaxed mb-6" style={{ color: '#F7F0E3', opacity: 0.75 }}>
              Sri Lanka has always been a land of extraordinary generosity. But as tourism grows, the families
              who built this culture — the small guesthouses, the roadside kottu stalls, the spice garden guides —
              often lose out to bigger operators with bigger marketing budgets.
            </p>
            <p className="font-sans text-base leading-relaxed" style={{ color: '#F7F0E3', opacity: 0.75 }}>
              SerendiGO is built differently. We put family-run businesses first. Our app quietly surfaces them
              to every traveller passing through — and your Serendipity Coins are worth most where it matters most.
              Spend them at the family restaurant, the village guesthouse, the local guide. The island gives you
              its story; you give something back.
            </p>
          </div>

          {/* Impact stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t" style={{ borderColor: 'rgba(247,240,227,0.1)' }}>
            <div>
              <p className="font-serif text-6xl md:text-7xl mb-2" style={{ color: '#E8832A' }}>66+</p>
              <p className="font-sans text-sm" style={{ color: '#F7F0E3', opacity: 0.6 }}>
                Local partners across Sri Lanka
              </p>
            </div>
            <div>
              <p className="font-serif text-6xl md:text-7xl mb-2" style={{ color: '#E8832A' }}>9</p>
              <p className="font-sans text-sm" style={{ color: '#F7F0E3', opacity: 0.6 }}>
                Provinces to discover and stamp
              </p>
            </div>
            <div>
              <p className="font-serif text-5xl md:text-6xl mb-2" style={{ color: '#E8832A' }}>🏠</p>
              <p className="font-sans text-sm" style={{ color: '#F7F0E3', opacity: 0.6 }}>
                Family-run businesses prioritised first — always
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section className="py-24 px-6" style={{ backgroundColor: '#FDFAF5' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-sans text-xs tracking-widest uppercase mb-4" style={{ color: '#E8832A' }}>
              Simple by design
            </p>
            <h2 className="font-serif text-4xl md:text-5xl" style={{ color: '#1A1A2E' }}>
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: '📱',
                title: 'Download the app',
                body: 'Create your explorer profile and meet your traveller character — shaped by a short quiz about the way you move through the world.',
              },
              {
                step: '02',
                icon: '🗺️',
                title: 'Choose your arc',
                body: 'Pick a story that calls to you. Food, wildlife, history, adventure or wellness — each arc is a curated journey through a real part of Sri Lanka.',
              },
              {
                step: '03',
                icon: '📸',
                title: 'Go there',
                body: 'Follow the chapters. Arrive in person, explore the place, photograph the moment. Your capture is your proof of presence.',
              },
              {
                step: '04',
                icon: '🪙',
                title: 'Earn & spend',
                body: 'Coins go in with every capture. Spend them at the family restaurant down the road. Exploration becomes generosity.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col">
                <div
                  className="font-sans text-xs tracking-widest font-semibold mb-4"
                  style={{ color: '#E8832A' }}
                >
                  {item.step}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-serif text-xl mb-3" style={{ color: '#1A1A2E' }}>
                  {item.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed" style={{ color: '#5A5A7A' }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          {/* Divider line connecting steps — decorative */}
          <div className="hidden md:block relative mt-0">
            {/* steps already shown above */}
          </div>
        </div>
      </section>

      {/* SECTION 5 — FOR PARTNERS */}
      <section id="partners" className="py-24 px-6" style={{ backgroundColor: '#1A6B7A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="font-sans text-xs tracking-widest uppercase mb-6 opacity-60" style={{ color: '#F7F0E3' }}>
              For local businesses
            </p>
            <h2 className="font-serif text-4xl md:text-6xl leading-tight mb-6" style={{ color: '#F7F0E3' }}>
              Grow with the people<br />
              who travel with purpose.
            </h2>
            <p className="font-sans text-base leading-relaxed mb-8" style={{ color: '#F7F0E3', opacity: 0.8 }}>
              SerendiGO brings explorers who want to eat where locals eat, sleep where families host, and
              experience what no guidebook lists. These aren&apos;t package tourists. They&apos;re curious, intentional
              travellers — and they&apos;re already spending coins to find you.
            </p>
            <Link
              href="/partners"
              className="inline-block font-sans font-semibold text-sm px-8 py-4 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#E8832A', color: '#FFFFFF' }}
            >
              Become a Partner →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🗺️',
                title: 'Visibility',
                body: 'Your business featured in story arcs, on the interactive island map, and in traveller discovery feeds. No algorithm games — we curate by hand.',
              },
              {
                icon: '🪙',
                title: 'Coin Redemptions',
                body: 'Accept Serendipity Coins as real discounts for your guests. We handle the tech — you get a printed QR code and a clean dashboard to track redemptions.',
              },
              {
                icon: '🏠',
                title: 'Family-run badge',
                body: 'Independently owned? We label you as family-run and surface you above chains in every search and nearby list. Because small should always come first.',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl p-8"
                style={{ backgroundColor: 'rgba(26,26,46,0.5)' }}
              >
                <div className="text-3xl mb-5">{benefit.icon}</div>
                <h3 className="font-serif text-xl mb-3" style={{ color: '#F7F0E3' }}>
                  {benefit.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed" style={{ color: '#F7F0E3', opacity: 0.7 }}>
                  {benefit.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — APP DOWNLOAD */}
      <section className="py-24 px-6 text-center" style={{ backgroundColor: '#F7F0E3' }}>
        <div className="max-w-2xl mx-auto">
          <p className="font-sans text-xs tracking-widest uppercase mb-6" style={{ color: '#E8832A' }}>
            Get the app
          </p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6" style={{ color: '#1A1A2E' }}>
            Ready to explore?
          </h2>
          <p className="font-sans text-base mb-10" style={{ color: '#5A5A7A' }}>
            Available on iOS and Android. Free to download.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#"
              className="flex items-center gap-3 px-7 py-4 rounded-full font-sans text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#1A1A2E', color: '#F7F0E3' }}
            >
              <span className="text-xl">📱</span>
              App Store
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-7 py-4 rounded-full font-sans text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#1A1A2E', color: '#F7F0E3' }}
            >
              <span className="text-xl">🤖</span>
              Google Play
            </a>
          </div>

          <p className="font-sans text-xs" style={{ color: '#5A5A7A', opacity: 0.7 }}>
            Currently in beta — launching 2026
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="font-serif text-xl mb-3" style={{ color: '#F7F0E3' }}>
              SerendiGO 🌴
            </p>
            <p className="font-sans text-sm mb-4" style={{ color: '#F7F0E3', opacity: 0.5 }}>
              The living guide to Sri Lanka
            </p>
            <p className="font-sans text-xs" style={{ color: '#F7F0E3', opacity: 0.35 }}>
              Made with ❤️ for Sri Lanka
            </p>
          </div>

          <div>
            <p className="font-sans text-xs tracking-widest uppercase mb-6 font-semibold" style={{ color: '#E8832A' }}>
              Links
            </p>
            <ul className="space-y-3">
              {[
                { label: 'For Explorers', href: '#experience' },
                { label: 'For Partners', href: '/partners' },
                { label: 'Download', href: '#' },
                { label: 'About', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-sans text-sm transition-opacity hover:opacity-100"
                    style={{ color: '#F7F0E3', opacity: 0.55 }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-sans text-xs tracking-widest uppercase mb-6 font-semibold" style={{ color: '#E8832A' }}>
              Contact
            </p>
            <a
              href="mailto:hello@serendigo.app"
              className="font-sans text-sm block mb-6 transition-opacity hover:opacity-100"
              style={{ color: '#F7F0E3', opacity: 0.55 }}
            >
              hello@serendigo.app
            </a>
            <p className="font-sans text-xs" style={{ color: '#F7F0E3', opacity: 0.3 }}>
              &copy; 2026 SerendiGO
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
