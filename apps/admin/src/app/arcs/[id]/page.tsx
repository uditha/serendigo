import { db } from '@/db'
import { arcs, chapters } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ArcForm from '@/components/ArcForm'
import { DeleteButton } from '@/components/DeleteButton'
import { updateArc, togglePublished, deleteArc } from '@/actions/arcs'
import { deleteChapter } from '@/actions/chapters'
import { Plus, Pencil, Globe, EyeOff, Check, AlertCircle, Coins } from 'lucide-react'

const WORLD_COLORS: Record<string, string> = {
  TASTE: 'bg-orange-100 text-orange-700',
  WILD: 'bg-green-100 text-green-700',
  MOVE: 'bg-blue-100 text-blue-700',
  ROOTS: 'bg-purple-100 text-purple-700',
  RESTORE: 'bg-yellow-100 text-yellow-700',
}

export default async function ArcDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const arc = (await db.select().from(arcs).where(eq(arcs.id, id)))[0]
  if (!arc) notFound()

  const arcChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.arcId, arc.id))
    .orderBy(chapters.order)

  const update = updateArc.bind(null, arc.id)
  const toggle = togglePublished.bind(null, arc.id, arc.isPublished)
  const remove = deleteArc.bind(null, arc.id)

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/arcs" className="text-sm text-gray-400 hover:text-gray-600">← Arcs</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{arc.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${WORLD_COLORS[arc.worldType] ?? 'bg-gray-100 text-gray-600'}`}>
              {arc.worldType}
            </span>
            <span className={`badge ${arc.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {arc.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={toggle}>
            <button className={`btn ${arc.isPublished ? 'btn-secondary' : 'btn-primary'}`}>
              {arc.isPublished ? <><EyeOff size={14} /> Unpublish</> : <><Globe size={14} /> Publish</>}
            </button>
          </form>
          <DeleteButton
            action={remove}
            confirmMessage="Delete this arc and all its chapters? This cannot be undone."
          />
        </div>
      </div>

      {/* Edit arc form */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Arc Details</h2>
        <ArcForm action={update} defaultValues={arc} />
      </div>

      {/* Chapters */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Chapters <span className="text-gray-400 font-normal">({arcChapters.length})</span>
          </h2>
          <Link href={`/arcs/${arc.id}/chapters/new`} className="btn-primary text-xs px-3 py-1.5">
            <Plus size={14} /> Add Chapter
          </Link>
        </div>

        {arcChapters.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No chapters yet.{' '}
            <Link href={`/arcs/${arc.id}/chapters/new`} className="text-[#E8832A] hover:underline">
              Add the first chapter →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-400">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Coins</th>
                <th className="px-6 py-3 font-medium">Lore</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {arcChapters.map((ch) => {
                const delChapter = deleteChapter.bind(null, arc.id, ch.id)
                return (
                  <tr key={ch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-400 font-medium">{ch.order}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{ch.title}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs font-mono">
                      {ch.lat.toFixed(4)}, {ch.lng.toFixed(4)}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Coins size={13} className="text-yellow-500" />
                        {ch.coinReward}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {ch.loreText ? (
                        <span className="badge bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                          <Check size={11} /> Lore
                        </span>
                      ) : (
                        <span className="badge bg-yellow-100 text-yellow-600 flex items-center gap-1 w-fit">
                          <AlertCircle size={11} /> Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/arcs/${arc.id}/chapters/${ch.id}`}
                          className="inline-flex items-center gap-1 text-[#E8832A] hover:underline text-xs"
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        <DeleteButton
                          action={delChapter}
                          confirmMessage={`Delete chapter "${ch.title}"? This cannot be undone.`}
                          label="Delete"
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
