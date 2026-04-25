import { db } from '@/db'
import { arcSubmissions, creators } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'

const STATUS_PILL: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-500',
  submitted: 'bg-blue-100 text-blue-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  published: 'bg-emerald-100 text-emerald-700',
}

const WORLD_DOT: Record<string, string> = {
  TASTE:   'bg-orange-400',
  WILD:    'bg-green-500',
  MOVE:    'bg-blue-500',
  ROOTS:   'bg-purple-500',
  RESTORE: 'bg-yellow-400',
}

export default async function SubmissionsAdminPage() {
  const rows = await db
    .select({
      submission: arcSubmissions,
      creatorName: creators.name,
      creatorEmail: creators.email,
    })
    .from(arcSubmissions)
    .leftJoin(creators, eq(arcSubmissions.creatorId, creators.id))
    .orderBy(desc(arcSubmissions.updatedAt))

  const submitted = rows.filter((r) => r.submission.status === 'submitted')
  const rest      = rows.filter((r) => r.submission.status !== 'submitted')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Arc submissions</h1>
        <p className="text-sm text-gray-500 mt-1">
          {submitted.length} awaiting review · {rows.length} total
        </p>
      </div>

      {submitted.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Awaiting review
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {submitted.map((r) => (
              <SubmissionRow key={r.submission.id} row={r} highlight />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            All submissions
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {rest.map((r) => (
              <SubmissionRow key={r.submission.id} row={r} />
            ))}
          </div>
        </section>
      )}

      {rows.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-16 text-center text-gray-400">
          No submissions yet.
        </div>
      )}
    </div>
  )
}

type Row = {
  submission: typeof arcSubmissions.$inferSelect
  creatorName: string | null
  creatorEmail: string | null
}

function SubmissionRow({ row, highlight }: { row: Row; highlight?: boolean }) {
  const s = row.submission
  const chapterCount = Array.isArray(s.chapters) ? s.chapters.length : 0

  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${highlight ? 'bg-blue-50/40' : 'hover:bg-gray-50'} transition-colors`}>
      {/* Cover thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {s.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">
            {s.worldType === 'TASTE' ? '🍜' : s.worldType === 'WILD' ? '🌿' : s.worldType === 'MOVE' ? '⚡' : s.worldType === 'ROOTS' ? '🏛️' : '🧘'}
          </div>
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${WORLD_DOT[s.worldType] ?? 'bg-gray-300'}`} />
          <span className="font-semibold text-gray-900 truncate">{s.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_PILL[s.status] ?? 'bg-gray-100'}`}>
            {s.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {row.creatorName ?? 'Unknown'} · {s.province.replace(/_/g, ' ')} · {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Date */}
      <div className="text-xs text-gray-400 shrink-0 hidden sm:block">
        {s.submittedAt
          ? s.submittedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
          : s.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </div>

      {/* Action */}
      <Link
        href={`/submissions/${s.id}`}
        className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
          highlight
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        Review
      </Link>
    </div>
  )
}
