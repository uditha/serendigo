'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',       label: 'Dashboard', icon: '📊' },
  { href: '/arcs',   label: 'Arcs',      icon: '🗺️' },
  { href: '/users',  label: 'Users',     icon: '👥' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[#1A1A2E] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <p className="text-white font-bold text-lg">SerendiGO</p>
        <p className="text-white/40 text-xs mt-0.5">Admin Panel</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#E8832A] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action="/api/logout" method="POST">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white w-full transition-colors">
            <span>🚪</span>
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
