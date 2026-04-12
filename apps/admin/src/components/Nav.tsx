'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Map, Users, Store, LogOut } from 'lucide-react'

const links = [
  { href: '/',         label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/arcs',     label: 'Arcs',      Icon: Map },
  { href: '/partners', label: 'Partners',  Icon: Store },
  { href: '/users',    label: 'Users',     Icon: Users },
]

export default function Nav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[#1A1A2E] min-h-screen flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-white/10">
        <p className="text-white font-bold text-lg">SerendiGO</p>
        <p className="text-white/40 text-xs mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, Icon }) => {
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
              <Icon size={16} />
              <span>{label}</span>
              {label === 'Partners' && pendingCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <form action="/api/logout" method="POST">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white w-full transition-colors">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
