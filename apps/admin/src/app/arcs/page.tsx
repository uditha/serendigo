import { db } from '@/db'
import { arcs, chapters } from '@/db/schema'
import { count, desc } from 'drizzle-orm'
import ArcsClient from '@/components/ArcsClient'

export default async function ArcsPage() {
  const allArcs = await db.select().from(arcs).orderBy(desc(arcs.createdAt))

  const chapterCounts = await db
    .select({ arcId: chapters.arcId, count: count() })
    .from(chapters)
    .groupBy(chapters.arcId)
  const countMap = Object.fromEntries(chapterCounts.map((c) => [c.arcId, c.count]))

  const arcsWithCounts = allArcs.map((a) => ({
    ...a,
    chapterCount: countMap[a.id] ?? 0,
  }))

  return <ArcsClient arcs={arcsWithCounts} />
}
