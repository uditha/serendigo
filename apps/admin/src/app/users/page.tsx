import { db } from '@/db'
import { user, captures } from '@/db/schema'
import { count, eq, desc } from 'drizzle-orm'

export default async function UsersPage() {
  const users = await db.select().from(user).orderBy(desc(user.createdAt)).limit(50)

  const captureCounts = await Promise.all(
    users.map((u) =>
      db.select({ count: count() }).from(captures).where(eq(captures.userId, u.id))
        .then((r) => ({ userId: u.id, count: r[0]?.count ?? 0 }))
    )
  )
  const countMap = Object.fromEntries(captureCounts.map((c) => [c.userId, c.count]))

  const CHARACTER_EMOJI: Record<string, string> = {
    TASTE: '🍛', WILD: '🐘', MOVE: '🏄', ROOTS: '🏛️', RESTORE: '🌿',
  }

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
                  <p className="font-medium text-gray-900">{u.name ?? 'No name'}</p>
                  <p className="text-gray-400 text-xs">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  {u.travellerCharacter ? (
                    <span>{CHARACTER_EMOJI[u.travellerCharacter]} {u.travellerCharacter}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">🪙 {u.serendipityCoins ?? 0}</td>
                <td className="px-6 py-4 text-gray-700">📸 {countMap[u.id] ?? 0}</td>
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
