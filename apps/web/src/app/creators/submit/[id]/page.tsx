import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import BrandMark from '@/components/BrandMark'
import { db } from '@/db'
import { arcSubmissions, type ChapterDraft } from '@/db/schema'
import { getCurrentCreator } from '../../actions'
import SubmitForm from '../SubmitForm'

export default async function EditSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const creator = await getCurrentCreator()
  if (!creator) redirect('/creators/login')
  if (creator.status !== 'approved') redirect('/creators/login')

  const rows = await db
    .select()
    .from(arcSubmissions)
    .where(and(eq(arcSubmissions.id, id), eq(arcSubmissions.creatorId, creator.id)))
    .limit(1)

  const submission = rows[0]
  if (!submission) notFound()

  const chapters = Array.isArray(submission.chapters) ? (submission.chapters as ChapterDraft[]) : []

  const readOnly = submission.status === 'approved' || submission.status === 'published' || submission.status === 'submitted'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sg-bg-section)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--sg-border-subtle)', padding: '18px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href="/creators/dashboard"
            className="flex items-center gap-2"
            style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--sg-ink)', textDecoration: 'none' }}
          >
            <span>SerendiGO</span>
            <BrandMark size={22} />
          </Link>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--sg-muted)' }}>
            {creator.name}
          </span>
        </div>
      </header>

      <section className="container" style={{ padding: '40px 0 80px', maxWidth: 860 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, color: 'var(--sg-ink)' }}>
            {submission.title || 'Untitled arc'}
          </h1>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, color: 'var(--sg-muted)', marginTop: 4 }}>
            Status: {submission.status}
          </p>
        </div>
        <SubmitForm
          initial={{
            id: submission.id,
            title: submission.title,
            tagline: submission.tagline,
            worldType: submission.worldType,
            province: submission.province,
            narrativeHook: submission.narrativeHook,
            coverImage: submission.coverImage,
            chapters,
            status: submission.status,
            adminFeedback: submission.adminFeedback,
          }}
          readOnly={readOnly}
        />
      </section>
    </main>
  )
}
