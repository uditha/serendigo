import { db } from '@/db'
import { arcs, chapters, captures, user } from '@/db/schema'
import { count, eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Map, MapPin, Users, Camera, ChevronRight } from 'lucide-react'

async function getStats() {
  const [arcCount, chapterCount, userCount, captureCount, publishedCount] = await Promise.all([
    db.select({ count: count() }).from(arcs),
    db.select({ count: count() }).from(chapters),
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(captures),
    db.select({ count: count() }).from(arcs).where(eq(arcs.isPublished, true)),
  ])
  return {
    arcs: arcCount[0]?.count ?? 0,
    chapters: chapterCount[0]?.count ?? 0,
    users: userCount[0]?.count ?? 0,
    captures: captureCount[0]?.count ?? 0,
    published: publishedCount[0]?.count ?? 0,
  }
}

async function getRecentArcs() {
  return db.select().from(arcs).orderBy(desc(arcs.createdAt)).limit(5)
}

const WORLD_COLORS: Record<string, string> = {
  TASTE: 'bg-orange-100 text-orange-700',
  WILD: 'bg-green-100 text-green-700',
  MOVE: 'bg-blue-100 text-blue-700',
  ROOTS: 'bg-purple-100 text-purple-700',
  RESTORE: 'bg-yellow-100 text-yellow-700',
}

export default async function DashboardPage() {
  const [stats, recentArcs] = await Promise.all([getStats(), getRecentArcs()])

  const statCards = [
    { label: 'Total Arcs',  value: stats.arcs,     sub: `${stats.published} published`, Icon: Map,    color: 'text-[#E8832A]', bg: 'bg-orange-50' },
    { label: 'Chapters',    value: stats.chapters, sub: 'across all arcs',              Icon: MapPin, color: 'text-[#1A6B7A]', bg: 'bg-teal-50' },
    { label: 'Users',       value: stats.users,    sub: 'registered travellers',        Icon: Users,  color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Captures',    value: stats.captures, sub: 'total moments captured',       Icon: Camera, color: 'text-green-600',  bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">SerendiGO content overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Arcs</h2>
          <Link href="/arcs" className="text-sm text-[#E8832A] hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">World</th>
              <th className="pb-2 font-medium">Province</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentArcs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                  No arcs yet.{' '}
                  <Link href="/arcs/new" className="text-[#E8832A] hover:underline">Create your first arc →</Link>
                </td>
              </tr>
            ) : recentArcs.map((arc) => (
              <tr key={arc.id} className="hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-900">{arc.title}</td>
                <td className="py-3">
                  <span className={`badge ${WORLD_COLORS[arc.worldType] ?? 'bg-gray-100 text-gray-600'}`}>
                    {arc.worldType}
                  </span>
                </td>
                <td className="py-3 text-gray-500">{arc.province.replace(/_/g, ' ')}</td>
                <td className="py-3">
                  <span className={`badge ${arc.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {arc.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <Link href={`/arcs/${arc.id}`} className="text-[#E8832A] hover:underline text-xs">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
