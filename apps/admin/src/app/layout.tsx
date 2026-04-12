import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { db } from '@/db'
import { partners } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'SerendiGO Admin',
  description: 'Content management for SerendiGO',
}

async function getPendingCount(): Promise<number> {
  try {
    const rows = await db
      .select({ id: partners.id })
      .from(partners)
      .where(and(eq(partners.isApproved, false), eq(partners.isActive, true)))
    return rows.length
  } catch {
    return 0
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pendingCount = await getPendingCount()

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex">
          <Nav pendingCount={pendingCount} />
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
