import { updateChapter } from '@/actions/chapters'
import ChapterForm from '@/components/ChapterForm'
import { db } from '@/db'
import { arcs, chapters } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditChapterPage({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params

  const [arc, chapter] = await Promise.all([
    db.select().from(arcs).where(eq(arcs.id, id)).then((r) => r[0]),
    db.select().from(chapters).where(eq(chapters.id, chapterId)).then((r) => r[0]),
  ])

  if (!arc || !chapter) notFound()

  const action = updateChapter.bind(null, arc.id, chapter.id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={`/arcs/${arc.id}`} className="text-sm text-gray-400 hover:text-gray-600">← {arc.title}</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Chapter {chapter.order}</h1>
        <p className="text-gray-500 text-sm mt-1">{chapter.title}</p>
      </div>
      <div className="card">
        <ChapterForm action={action} defaultValues={chapter} defaultOrder={chapter.order} xpCategory={arc.worldType} />
      </div>
    </div>
  )
}
