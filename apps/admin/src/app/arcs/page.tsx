import { db } from '@/db'
import { arcs, chapters } from '@/db/schema'
import { count, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

const WORLD_COLORS: Record<string, string> = {
  TASTE: 'bg-orange-100 text-orange-700',
  WILD: 'bg-green-100 text-green-700',
  MOVE: 'bg-blue-100 text-blue-700',
  ROOTS: 'bg-purple-100 text-purple-700',
  RESTORE: 'bg-yellow-100 text-yellow-700',
}

export default async function ArcsPage() {
  const allArcs = await db.select().from(arcs).orderBy(desc(arcs.createdAt))

  // Single aggregation query instead of N+1
  const chapterCounts = await db
    .select({ arcId: chapters.arcId, count: count() })
    .from(chapters)
    .groupBy(chapters.arcId)
  const countMap = Object.fromEntries(chapterCounts.map((c) => [c.arcId, c.count]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arcs</h1>
          <p className="text-gray-500 text-sm mt-1">{allArcs.length} total arcs</p>
        </div>
        <Link href="/arcs/new" className="btn-primary">
          <Plus size={16} />
          New Arc
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">World</th>
              <th className="px-6 py-3 font-medium">Province</th>
              <th className="px-6 py-3 font-medium">Chapters</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allArcs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No arcs yet.{' '}
                  <Link href="/arcs/new" className="text-[#E8832A] hover:underline">Create your first arc →</Link>
                </td>
              </tr>
            ) : allArcs.map((arc) => (
              <tr key={arc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{arc.title}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${WORLD_COLORS[arc.worldType] ?? 'bg-gray-100 text-gray-600'}`}>
                    {arc.worldType}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{arc.province.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4 text-gray-500">{countMap[arc.id] ?? 0}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${arc.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {arc.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/arcs/${arc.id}`} className="inline-flex items-center gap-1 text-[#E8832A] hover:underline text-xs">
                    <Pencil size={12} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
