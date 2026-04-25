import { db } from '@/db'
import { creators, type Creator } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { approveCreator, rejectCreator, suspendCreator } from '@/actions/creators'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-200 text-gray-600',
}

export default async function CreatorsAdminPage() {
  const all = await db.select().from(creators).orderBy(desc(creators.createdAt))

  const pending = all.filter((c) => c.status === 'pending')
  const rest = all.filter((c) => c.status !== 'pending')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Creator applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pending.length} pending · {all.length} total
        </p>
      </div>

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Pending review ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((c) => (
              <CreatorCard key={c.id} creator={c} showActions />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            All creators ({rest.length})
          </h2>
          <div className="space-y-3">
            {rest.map((c) => (
              <CreatorCard key={c.id} creator={c} showActions={c.status === 'approved'} />
            ))}
          </div>
        </section>
      )}

      {all.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-400">
          No applications yet.
        </div>
      )}
    </div>
  )
}

function CreatorCard({ creator: c, showActions }: { creator: Creator; showActions?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{c.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] ?? 'bg-gray-100'}`}>
              {c.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{c.email}</p>
          {(c.province || c.instagram || c.website) && (
            <p className="text-xs text-gray-400 mt-1">
              {[c.province?.replace(/_/g, ' '), c.instagram ? `@${c.instagram}` : null, c.website].filter(Boolean).join(' · ')}
            </p>
          )}
          {c.bio && (
            <p className="text-sm text-gray-600 mt-2 italic">{c.bio}</p>
          )}
          {c.applicationNote && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">Sample arc concept</p>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{c.applicationNote}</p>
            </div>
          )}
          {c.rejectionReason && (
            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
              Reason: {c.rejectionReason}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Applied {c.createdAt.toLocaleDateString()}
            {c.approvedAt ? ` · Approved ${c.approvedAt.toLocaleDateString()}` : ''}
          </p>
        </div>

        {showActions && (
          <div className="flex flex-col gap-2 shrink-0">
            {c.status === 'pending' && (
              <>
                <form action={approveCreator.bind(null, c.id)}>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg w-full">
                    Approve
                  </button>
                </form>
                <RejectForm id={c.id} />
              </>
            )}
            {c.status === 'approved' && (
              <form action={suspendCreator.bind(null, c.id)}>
                <button className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg w-full">
                  Suspend
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function RejectForm({ id }: { id: string }) {
  return (
    <form action={rejectCreator} className="flex flex-col gap-1">
      <input type="hidden" name="id" value={id} />
      <input
        name="reason"
        placeholder="Reason (optional)"
        className="text-xs border border-gray-300 rounded px-2 py-1 w-32"
      />
      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg w-full">
        Reject
      </button>
    </form>
  )
}
