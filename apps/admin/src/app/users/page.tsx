import { db } from '@/db'
import { user, captures } from '@/db/schema'
import { count, desc } from 'drizzle-orm'
import { Camera, CircleDollarSign } from 'lucide-react'

const CHARACTER_COLORS: Record<string, string> = {
  TASTE:   'bg-orange-100 text-orange-700',
  WILD:    'bg-green-100  text-green-700',
  MOVE:    'bg-blue-100   text-blue-700',
  ROOTS:   'bg-purple-100 text-purple-700',
  RESTORE: 'bg-yellow-100 text-yellow-700',
}

export default async function UsersPage() {
  const users = await db.select().from(user).orderBy(desc(user.createdAt)).limit(50)

  // Single aggregation query instead of N+1
  const captureCounts = await db
    .select({ userId: captures.userId, count: count() })
    .from(captures)
    .groupBy(captures.userId)
  const countMap = Object.fromEntries(captureCounts.map((c) => [c.userId, c.count]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} registered travellers (most recent 50)</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Character</th>
              <th className="px-6 py-3 font-medium">Coins</th>
              <th className="px-6 py-3 font-medium">Captures</th>
              <th className="px-6 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No users yet</td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xs">
                      {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name ?? 'No name'}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {u.travellerCharacter ? (
                    <span className={`badge ${CHARACTER_COLORS[u.travellerCharacter] ?? 'bg-gray-100 text-gray-600'}`}>
                      {u.travellerCharacter}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-gray-700">
                    <CircleDollarSign size={14} className="text-yellow-500" />
                    {u.serendipityCoins ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-gray-700">
                    <Camera size={14} className="text-gray-400" />
                    {countMap[u.id] ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
