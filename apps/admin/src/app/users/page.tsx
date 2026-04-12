import { db } from '@/db'
import { user, captures } from '@/db/schema'
import { count, desc } from 'drizzle-orm'
import UsersClient from '@/components/UsersClient'

export default async function UsersPage() {
  const users = await db.select().from(user).orderBy(desc(user.createdAt))

  const captureCounts = await db
    .select({ userId: captures.userId, count: count() })
    .from(captures)
    .groupBy(captures.userId)
  const countMap = Object.fromEntries(captureCounts.map((c) => [c.userId, c.count]))

  const usersWithCounts = users.map((u) => ({
    ...u,
    captureCount: countMap[u.id] ?? 0,
  }))

  return <UsersClient users={usersWithCounts} />
}
