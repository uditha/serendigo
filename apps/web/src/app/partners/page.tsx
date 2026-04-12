'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PartnersPage() {
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
            <Link
              href="/#experience"
              className="font-sans text-sm transition-colors hidden md:inline"
              style={{ color: 'rgba(26,26,46,0.7)' }}
            >
              For Explorers
            </Link>
            <Link
              href="/"
              className="font-sans text-sm px-4 py-2 rounded-full text-white transition-colors"
              style={{ backgroundColor: '#1A6B7A' }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="min-h-screen flex items-center justify-center px-6 pt-20"
        style={{ backgroundColor: '#1A6B7A' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-block font-sans text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-8"
            style={{ backgroundColor: 'rgba(232,131,42,0.2)', color: '#E8832A' }}
          >
            Partner with SerendiGO
          </div>

          <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-8" style={{ color: '#F7F0E3' }}>
            Join the explorers&apos; map.
          </h1>

          <p className="font-sans text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: '#F7F0E3', opacity: 0.8 }}>
            SerendiGO connects your business with travellers who specifically seek out local,
            family-run experiences. Not bus-tour crowds — curious, intentional explorers
            who want the real Sri Lanka.
          </p>

          <a
            href="#apply"
            className="inline-block font-sans font-semibold text-sm px-8 py-4 rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#E8832A', color: '#FFFFFF' }}
          >
            Apply to Join →
          </a>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-24 px-6" style={{ backgroundColor: '#F7F0E3' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-sans text-xs tracking-widest uppercase mb-4" style={{ color: '#E8832A' }}>
              What&apos;s included
            </p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4" style={{ color: '#1A1A2E' }}>
              Everything you need.<br />None of the complexity.
            </h2>
            <p className="font-sans text-base max-w-xl mx-auto" style={{ color: '#5A5A7A' }}>
              We built SerendiGO so local businesses could benefit from digital discovery
              without needing a tech team, a marketing budget, or a social media strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: '🗺️',
                title: 'Visibility on the island map',
                body: 'Your business appears on SerendiGO\'s interactive Sri Lanka map — discoverable by every explorer in your province. We feature you in story arcs whenever your location is relevant to a chapter.',
                tag: 'Discovery',
                tagColor: '#1A5F8A',
                tagBg: 'rgba(26,95,138,0.1)',
              },
              {
                icon: '📖',
                title: 'Chapter featuring',
                body: 'The best local businesses get woven into our story arcs directly. Your kottu stall becomes part of a Colombo food trail. Your guesthouse becomes a chapter in a Ella mountain arc. You become the story.',
                tag: 'Story Arcs',
                tagColor: '#614A9E',
                tagBg: 'rgba(97,74,158,0.1)',
              },
              {
                icon: '🪙',
                title: 'QR coin redemptions',
                body: 'Explorers earn Serendipity Coins through travel and spend them with you as real discounts. We provide a printed QR code for your counter and a clean dashboard to track every redemption in real time.',
                tag: 'Revenue',
                tagColor: '#B85C1A',
                tagBg: 'rgba(184,92,26,0.1)',
              },
              {
                icon: '🏠',
                title: 'Family-run badge',
                body: 'Independently owned and operated? We give you a family-run badge and sort you above chain businesses in every search result, nearby list, and discovery feed. Small will always come first on SerendiGO.',
                tag: 'Recognition',
                tagColor: '#2D6E4E',
                tagBg: 'rgba(45,110,78,0.1)',
              },
            ].map((feature) => (
              <article key={feature.title} className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
                <div className="text-4xl mb-5">{feature.icon}</div>
                <h3 className="font-serif text-2xl mb-3" style={{ color: '#1A1A2E' }}>
                  {feature.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: '#5A5A7A' }}>
                  {feature.body}
                </p>
                <span
                  className="font-sans text-xs tracking-wide uppercase font-semibold px-3 py-1 rounded-full"
                  style={{ color: feature.tagColor, backgroundColor: feature.tagBg }}
                >
                  {feature.tag}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS FOR PARTNERS */}
      <section className="py-24 px-6" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-sans text-xs tracking-widest uppercase mb-4" style={{ color: '#E8832A' }}>
              The process
            </p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4" style={{ color: '#F7F0E3' }}>
              Three steps to going live.
            </h2>
            <p className="font-sans text-base max-w-xl mx-auto" style={{ color: '#F7F0E3', opacity: 0.6 }}>
              We keep it personal. No automated approval queues, no anonymous onboarding.
              Every partner on SerendiGO has been reviewed by a real human.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Apply online',
                body: 'Fill in the short form below. Tell us about your business, your location, and what makes you special. It takes five minutes.',
                icon: '✏️',
              },
              {
                step: '02',
                title: 'We visit & verify',
                body: 'Our team reviews every application personally. For family-run businesses, we may arrange a brief visit or call to understand your story and how best to feature you.',
                icon: '🤝',
              },
              {
                step: '03',
                title: 'You go live on the map',
                body: 'Once approved, your business appears on the SerendiGO island map. We send your QR redemption code, and explorers can start finding you immediately.',
                icon: '🗺️',
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <p className="font-sans text-xs tracking-widest font-semibold mb-3" style={{ color: '#E8832A' }}>
                  {step.step}
                </p>
                <h3 className="font-serif text-xl mb-4" style={{ color: '#F7F0E3' }}>
                  {step.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed" style={{ color: '#F7F0E3', opacity: 0.6 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply" className="py-24 px-6" style={{ backgroundColor: '#FDFAF5' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-sans text-xs tracking-widest uppercase mb-4" style={{ color: '#E8832A' }}>
              Apply now
            </p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4" style={{ color: '#1A1A2E' }}>
              Tell us about<br />your business.
            </h2>
            <p className="font-sans text-sm" style={{ color: '#5A5A7A' }}>
              We review every application personally and will be in touch within 3 business days.
            </p>
          </div>

          <form action="#" className="space-y-6">
            {/* Business name */}
            <div>
              <label className="block font-sans text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                Business name <span style={{ color: '#E8832A' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Amara Family Guesthouse"
                className="w-full px-4 py-3 rounded-xl border font-sans text-sm outline-none transition-all"
                style={{
                  borderColor: 'rgba(26,26,46,0.15)',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A2E',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#E8832A')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(26,26,46,0.15)')}
              />
            </div>

            {/* Category + Province row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                  Category <span style={{ color: '#E8832A' }}>*</span>
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border font-sans text-sm outline-none appearance-none cursor-pointer"
                  style={{
                    borderColor: 'rgba(26,26,46,0.15)',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A2E',
                  }}
                >
                  <option value="">Select category</option>
                  <option value="food">Food &amp; Drink</option>
                  <option value="stay">Accommodation</option>
                  <option value="experience">Experience / Activity</option>
                  <option value="shop">Shop / Retail</option>
                  <option value="transport">Transport</option>
                </select>
              </div>

              <div>
                <label className="block font-sans text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                  Province <span style={{ color: '#E8832A' }}>*</span>
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border font-sans text-sm outline-none appearance-none cursor-pointer"
                  style={{
                    borderColor: 'rgba(26,26,46,0.15)',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A2E',
                  }}
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
              </div>
            </div>

            {/* Contact name + Email row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                  Your name <span style={{ color: '#E8832A' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dilani Perera"
                  className="w-full px-4 py-3 rounded-xl border font-sans text-sm outline-none transition-all"
                  style={{
                    borderColor: 'rgba(26,26,46,0.15)',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A2E',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#E8832A')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(26,26,46,0.15)')}
                />
              </div>

              <div>
                <label className="block font-sans text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                  Email address <span style={{ color: '#E8832A' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border font-sans text-sm outline-none transition-all"
                  style={{
                    borderColor: 'rgba(26,26,46,0.15)',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A2E',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#E8832A')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(26,26,46,0.15)')}
                />
              </div>
            </div>

            {/* Phone / WhatsApp */}
            <div>
              <label className="block font-sans text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+94 77 123 4567"
                className="w-full px-4 py-3 rounded-xl border font-sans text-sm outline-none transition-all"
                style={{
                  borderColor: 'rgba(26,26,46,0.15)',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A2E',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#E8832A')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(26,26,46,0.15)')}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-sans text-sm font-semibold mb-2" style={{ color: '#1A1A2E' }}>
                Tell us about your business <span style={{ color: '#E8832A' }}>*</span>
              </label>
              <textarea
                rows={5}
                placeholder="What do you offer? What makes your place special? What kind of traveller would love it?"
                className="w-full px-4 py-3 rounded-xl border font-sans text-sm outline-none transition-all resize-none"
                style={{
                  borderColor: 'rgba(26,26,46,0.15)',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A2E',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#E8832A')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(26,26,46,0.15)')}
              />
            </div>

            {/* Family-run radio */}
            <div>
              <label className="block font-sans text-sm font-semibold mb-3" style={{ color: '#1A1A2E' }}>
                Is your business family-run or independently owned?{' '}
                <span style={{ color: '#E8832A' }}>*</span>
              </label>
              <p className="font-sans text-xs mb-4" style={{ color: '#5A5A7A' }}>
                Family-run means you own and operate it yourself — not a franchise, chain, or corporate-backed property.
              </p>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="family_run"
                    value="yes"
                    className="w-4 h-4 cursor-pointer accent-amber"
                    style={{ accentColor: '#E8832A' }}
                  />
                  <span className="font-sans text-sm" style={{ color: '#1A1A2E' }}>
                    Yes — family-run 🏠
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="family_run"
                    value="no"
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: '#E8832A' }}
                  />
                  <span className="font-sans text-sm" style={{ color: '#1A1A2E' }}>
                    No
                  </span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full font-sans font-semibold text-sm py-4 rounded-full text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#E8832A' }}
              >
                Apply to join SerendiGO
              </button>
              <p className="font-sans text-xs text-center mt-4" style={{ color: '#5A5A7A' }}>
                We review every application personally and will be in touch within 3 business days.
              </p>
            </div>
          </form>
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
                { label: 'For Explorers', href: '/#experience' },
                { label: 'For Partners', href: '/partners' },
                { label: 'Download', href: '#' },
                { label: 'About', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm transition-opacity hover:opacity-100"
                    style={{ color: '#F7F0E3', opacity: 0.55 }}
                  >
                    {link.label}
                  </Link>
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
