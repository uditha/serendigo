import Link from 'next/link'
import { redirect } from 'next/navigation'
import BrandMark from '@/components/BrandMark'
import { getCurrentCreator } from '../actions'
import SubmitForm from './SubmitForm'

export default async function NewSubmissionPage() {
  const creator = await getCurrentCreator()
  if (!creator) redirect('/creators/login')
  if (creator.status !== 'approved') redirect('/creators/login')

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sg-bg-section)' }}>
      <Header name={creator.name} />
      <section className="container" style={{ padding: '40px 0 80px', maxWidth: 860 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, color: 'var(--sg-ink)' }}>
            New arc submission
          </h1>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, color: 'var(--sg-muted)', marginTop: 4 }}>
            Save drafts as you work. Submit when you&apos;re ready — at least 1 chapter required.
          </p>
        </div>
        <SubmitForm />
      </section>
    </main>
  )
}

function Header({ name }: { name: string }) {
  return (
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
          {name}
        </span>
      </div>
    </header>
  )
}
