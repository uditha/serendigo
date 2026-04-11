import { createChapter } from '@/actions/chapters'
import ChapterForm from '@/components/ChapterForm'
import { db } from '@/db'
import { arcs, chapters } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function NewChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const arc = (await db.select().from(arcs).where(eq(arcs.id, id)))[0]
  if (!arc) notFound()

  const [chapterCount] = await db.select({ count: count() }).from(chapters).where(eq(chapters.arcId, id))
  const nextOrder = (chapterCount?.count ?? 0) + 1

  const action = createChapter.bind(null, arc.id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={`/arcs/${arc.id}`} className="text-sm text-gray-400 hover:text-gray-600">← {arc.title}</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Chapter</h1>
        <p className="text-gray-500 text-sm mt-1">Chapter {nextOrder} of {arc.title}</p>
      </div>
      <div className="card">
        <ChapterForm action={action} defaultOrder={nextOrder} xpCategory={arc.worldType} />
      </div>
    </div>
  )
}
