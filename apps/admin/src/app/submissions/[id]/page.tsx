import { db } from '@/db'
import { arcSubmissions, creators } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { approveSubmission, rejectSubmission } from '@/actions/creators'
import type { ChapterDraft } from '@/types/creator'

const STATUS_PILL: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-500',
  submitted: 'bg-blue-100 text-blue-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  published: 'bg-emerald-100 text-emerald-700',
}

const WORLD_COLOR: Record<string, string> = {
  TASTE:   'bg-orange-100 text-orange-700',
  WILD:    'bg-green-100 text-green-700',
  MOVE:    'bg-blue-100 text-blue-700',
  ROOTS:   'bg-purple-100 text-purple-700',
  RESTORE: 'bg-yellow-100 text-yellow-700',
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const rows = await db
    .select({ submission: arcSubmissions, creator: creators })
    .from(arcSubmissions)
    .leftJoin(creators, eq(arcSubmissions.creatorId, creators.id))
    .where(eq(arcSubmissions.id, id))
    .limit(1)

  if (!rows[0]) notFound()

  const { submission: s, creator } = rows[0]
  const chapters = Array.isArray(s.chapters) ? (s.chapters as ChapterDraft[]) : []
  const canAct = s.status === 'submitted'

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Back */}
      <Link href="/submissions" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-6">
        ← Back to submissions
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {s.coverImage ? (
          <div className="relative h-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_PILL[s.status]}`}>{s.status}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${WORLD_COLOR[s.worldType]}`}>{s.worldType}</span>
                <span className="text-xs bg-black/30 text-white px-2 py-0.5 rounded-full">{s.province.replace(/_/g, ' ')}</span>
              </div>
              <h1 className="text-white text-2xl font-bold">{s.title}</h1>
              {s.tagline && <p className="text-white/80 text-sm mt-1">{s.tagline}</p>}
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_PILL[s.status]}`}>{s.status}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${WORLD_COLOR[s.worldType]}`}>{s.worldType}</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s.province.replace(/_/g, ' ')}</span>
            </div>
            <h1 className="text-gray-900 text-2xl font-bold">{s.title}</h1>
            {s.tagline && <p className="text-gray-500 text-sm mt-1">{s.tagline}</p>}
          </div>
        )}

        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="text-gray-600">
            <span className="font-semibold text-gray-900">{creator?.name ?? 'Unknown'}</span>
            {creator?.email && <span className="text-gray-400 ml-2">{creator.email}</span>}
          </div>
          <div className="text-xs text-gray-400">
            {s.submittedAt
              ? `Submitted ${s.submittedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : `Updated ${s.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </div>
        </div>
      </div>

      {/* Narrative hook */}
      {s.narrativeHook && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Narrative hook</p>
          <p className="text-gray-700 italic leading-relaxed border-l-2 border-orange-200 pl-4">{s.narrativeHook}</p>
        </div>
      )}

      {/* Chapters */}
      {chapters.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Chapters ({chapters.length})
          </p>
          <div className="space-y-4">
            {chapters.map((ch, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {ch.coverImage && (
                  <div className="h-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ch.coverImage} alt={ch.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">Ch {i + 1}</span>
                    <span className="font-semibold text-gray-900">{ch.title || <em className="text-gray-400 font-normal">Untitled</em>}</span>
                  </div>

                  {ch.task && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Task</p>
                      <p className="text-sm text-gray-700">{ch.task}</p>
                    </div>
                  )}

                  {ch.lore && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Lore</p>
                      <p className="text-sm text-gray-600 italic leading-relaxed">{ch.lore}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-gray-50">
                    {ch.lat && ch.lng ? (
                      <a
                        href={`https://maps.google.com/?q=${ch.lat},${ch.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 underline"
                      >
                        📍 {Number(ch.lat).toFixed(5)}, {Number(ch.lng).toFixed(5)}
                      </a>
                    ) : (
                      <span className="text-red-400">⚠ No GPS coordinates</span>
                    )}
                    {ch.coinReward !== undefined && <span>🪙 {ch.coinReward} coins</span>}
                    {ch.xpCategory && <span>⚡ {ch.xpCategory}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing feedback */}
      {s.adminFeedback && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 mb-6">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Feedback sent</p>
          <p className="text-sm text-red-700">{s.adminFeedback}</p>
        </div>
      )}

      {/* Published link */}
      {s.publishedArcId && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-green-700">Published as live arc</p>
          <Link href={`/arcs/${s.publishedArcId}`} className="text-sm text-green-600 underline">
            View arc →
          </Link>
        </div>
      )}

      {/* Actions */}
      {canAct && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Review decision</p>
          <div className="flex flex-col gap-3">
            <form action={approveSubmission}>
              <input type="hidden" name="id" value={s.id} />
              <button className="w-full px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
                ✓ Approve &amp; publish arc
              </button>
            </form>
            <form action={rejectSubmission} className="flex gap-2">
              <input type="hidden" name="id" value={s.id} />
              <input
                name="feedback"
                placeholder="Feedback for creator…"
                className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400"
              />
              <button className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shrink-0 transition-colors">
                Request changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
