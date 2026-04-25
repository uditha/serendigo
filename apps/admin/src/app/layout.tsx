import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { db } from '@/db'
import { partners, creators, arcSubmissions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'SerendiGO Admin',
  description: 'Content management for SerendiGO',
}

async function getBadgeCounts() {
  try {
    const [pendingPartners, pendingCreatorsRows, pendingSubsRows] = await Promise.all([
      db.select({ id: partners.id }).from(partners).where(and(eq(partners.isApproved, false), eq(partners.isActive, true))),
      db.select({ id: creators.id }).from(creators).where(eq(creators.status, 'pending')),
      db.select({ id: arcSubmissions.id }).from(arcSubmissions).where(eq(arcSubmissions.status, 'submitted')),
    ])
    return {
      pendingCount: pendingPartners.length,
      pendingCreators: pendingCreatorsRows.length,
      pendingSubmissions: pendingSubsRows.length,
    }
  } catch {
    return { pendingCount: 0, pendingCreators: 0, pendingSubmissions: 0 }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { pendingCount, pendingCreators, pendingSubmissions } = await getBadgeCounts()

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex">
          <Nav
            pendingCount={pendingCount}
            pendingCreators={pendingCreators}
            pendingSubmissions={pendingSubmissions}
          />
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
