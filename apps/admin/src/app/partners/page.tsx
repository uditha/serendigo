import { db } from '@/db'
import { partners, flashDeals } from '@/db/schema'
import { desc, eq, count, and, gte } from 'drizzle-orm'
import PartnersClient from '@/components/PartnersClient'

export default async function PartnersPage() {
  const allPartners = await db.select().from(partners).orderBy(desc(partners.createdAt))

  const activeDeals = await db
    .select({ partnerId: flashDeals.partnerId, count: count() })
    .from(flashDeals)
    .where(and(eq(flashDeals.isActive, true), gte(flashDeals.expiresAt, new Date())))
    .groupBy(flashDeals.partnerId)
  const dealMap = Object.fromEntries(activeDeals.map((d) => [d.partnerId, d.count]))

  const partnersWithDeals = allPartners.map((p) => ({
    ...p,
    activeDeals: dealMap[p.id] ?? 0,
  }))

  return <PartnersClient partners={partnersWithDeals} />
}
