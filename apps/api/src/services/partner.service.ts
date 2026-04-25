import { db } from '../db'
import {
  partners,
  chapterFeaturedPartners,
  flashDeals,
  partnerReviews,
  captures,
} from '../db/schema'
import { eq, and, sql, desc, asc, inArray, lte, gte } from 'drizzle-orm'
import { haversineMeters } from '../utils/haversine-sql'
import type { PartnerCategory } from '../db/schema/partners'
import { user } from '../db/schema/auth'

// Category-based discovery radius (metres) — Sri Lanka reality
const CATEGORY_RADIUS: Record<PartnerCategory, number> = {
  FOOD: 1500,
  STAY: 8000,
  EXPERIENCE: 15000,
  SHOP: 3000,
  TRANSPORT: 10000,
}

export interface PartnerSummary {
  id: string
  name: string
  category: string
  tagline: string
  lat: number
  lng: number
  district: string | null
  province: string
  tier: string
  photos: string[]
  priceMin: number | null
  priceMax: number | null
  tags: string[]
  avgRating: number | null
  reviewCount: number
  distanceM?: number
  isFeatured?: boolean
}

export interface PartnerDetail extends PartnerSummary {
  description: string
  phone: string | null
  whatsapp: string | null
  website: string | null
  openingHours: Record<string, string> | null
  reviews: ReviewItem[]
}

export interface ReviewItem {
  id: string
  rating: number
  body: string | null
  isVerified: boolean
  createdAt: Date
  user: { id: string; name: string | null }
}

// Attach avg rating + review count to any set of partner rows
async function attachRatings(
  rows: Array<typeof partners.$inferSelect>,
): Promise<PartnerSummary[]> {
  if (rows.length === 0) return []
  const ids = rows.map((p) => p.id)

  const ratings = await db
    .select({
      partnerId: partnerReviews.partnerId,
      avg: sql<number>`round(avg(${partnerReviews.rating})::numeric, 1)`,
      count: sql<number>`count(*)::int`,
    })
    .from(partnerReviews)
    .where(inArray(partnerReviews.partnerId, ids))
    .groupBy(partnerReviews.partnerId)

  const ratingMap = Object.fromEntries(
    ratings.map((r) => [r.partnerId, { avg: r.avg, count: r.count }]),
  )

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tagline: p.tagline,
    lat: p.lat,
    lng: p.lng,
    district: p.district,
    province: p.province,
    tier: p.tier,
    photos: p.photos,
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    tags: p.tags,
    isLocal: p.isLocal,
    avgRating: ratingMap[p.id]?.avg ?? null,
    reviewCount: ratingMap[p.id]?.count ?? 0,
  }))
}

// --- NEARBY (chapter context) ---
// Haversine distance + category-specific radius (no PostGIS — works on plain Postgres)
// If nothing found at default radius, doubles it once ("expand if empty")
export async function getNearbyPartners(
  lat: number,
  lng: number,
  category?: PartnerCategory,
  maxResults = 6,
): Promise<PartnerSummary[]> {
  const tryRadius = async (radius: number) => {
    const conditions = [
      eq(partners.isActive, true),
      eq(partners.isApproved, true),
      sql`${haversineMeters(partners.lat, partners.lng, lat, lng)} <= ${radius}`,
    ]
    if (category) conditions.push(eq(partners.category, category))

    return db
      .select({
        partner: partners,
        distanceM: sql<number>`round(${haversineMeters(partners.lat, partners.lng, lat, lng)})::int`,
      })
      .from(partners)
      .where(and(...conditions))
      .orderBy(haversineMeters(partners.lat, partners.lng, lat, lng))
      .limit(maxResults)
  }

  const defaultRadius = category ? CATEGORY_RADIUS[category] : 2000
  let rows = await tryRadius(defaultRadius)

  // Expand if empty — show the closest option at any distance
  if (rows.length === 0) {
    rows = await tryRadius(defaultRadius * 2)
  }

  const summaries = await attachRatings(rows.map((r) => r.partner))
  const withDistance = summaries.map((s, i) => ({ ...s, distanceM: rows[i].distanceM }))
  // Sort: family-run first if within 500m of the closest partner
  const minDist = withDistance[0]?.distanceM ?? 0
  return withDistance.sort((a, b) => {
    const aLocal = a.isLocal && (a.distanceM ?? 0) - minDist < 500 ? 1 : 0
    const bLocal = b.isLocal && (b.distanceM ?? 0) - minDist < 500 ? 1 : 0
    return bLocal - aLocal
  })
}

// --- CHAPTER: featured picks + nearby across all categories ---
export async function getChapterPartners(
  chapterId: string,
  chapterLat: number,
  chapterLng: number,
): Promise<{ featured: PartnerSummary[]; nearby: PartnerSummary[] }> {
  // Featured (editorial) — ordered by displayOrder
  const featuredRows = await db
    .select({ partner: partners, displayOrder: chapterFeaturedPartners.displayOrder })
    .from(chapterFeaturedPartners)
    .innerJoin(partners, eq(partners.id, chapterFeaturedPartners.partnerId))
    .where(
      and(
        eq(chapterFeaturedPartners.chapterId, chapterId),
        eq(partners.isActive, true),
        eq(partners.isApproved, true),
      ),
    )
    .orderBy(asc(chapterFeaturedPartners.displayOrder))

  const featuredPartnerIds = new Set(featuredRows.map((r) => r.partner.id))
  const featured = await attachRatings(featuredRows.map((r) => r.partner))

  // Nearby — all categories, exclude already-featured partners, closest 8
  const nearbyAll = await getNearbyPartners(chapterLat, chapterLng, undefined, 12)
  const nearby = nearbyAll
    .filter((p) => !featuredPartnerIds.has(p.id))
    .sort((a, b) => (b.isLocal ? 1 : 0) - (a.isLocal ? 1 : 0))
    .slice(0, 8)

  return {
    featured: featured.map((p) => ({ ...p, isFeatured: true })),
    nearby,
  }
}

// --- PROVINCE (arc planning view) ---
export async function getProvincePartners(
  province: string,
  category?: PartnerCategory,
): Promise<Record<string, PartnerSummary[]>> {
  const conditions = [
    eq(partners.province, province.toUpperCase()),
    eq(partners.isActive, true),
    eq(partners.isApproved, true),
  ]
  if (category) conditions.push(eq(partners.category, category))

  const rows = await db
    .select()
    .from(partners)
    .where(and(...conditions))
    .orderBy(
      sql`CASE WHEN ${partners.isLocal} THEN 0 ELSE 1 END`,  // family-run first
      sql`CASE ${partners.tier} WHEN 'premium' THEN 0 WHEN 'partner' THEN 1 ELSE 2 END`,
      asc(partners.name),
    )

  const summaries = await attachRatings(rows)

  // Group by category
  const grouped: Record<string, PartnerSummary[]> = {}
  for (const p of summaries) {
    if (!grouped[p.category]) grouped[p.category] = []
    grouped[p.category].push(p)
  }
  return grouped
}

// --- DETAIL ---
export async function getPartnerById(id: string): Promise<PartnerDetail | null> {
  const [row] = await db
    .select()
    .from(partners)
    .where(and(eq(partners.id, id), eq(partners.isActive, true), eq(partners.isApproved, true)))
    .limit(1)

  if (!row) return null

  const [summaries, reviewRows] = await Promise.all([
    attachRatings([row]),
    db
      .select({
        review: partnerReviews,
        userName: user.name,
      })
      .from(partnerReviews)
      .innerJoin(user, eq(user.id, partnerReviews.userId))
      .where(eq(partnerReviews.partnerId, id))
      .orderBy(desc(partnerReviews.isVerified), desc(partnerReviews.createdAt))
      .limit(50),
  ])

  const reviews: ReviewItem[] = reviewRows.map((r) => ({
    id: r.review.id,
    rating: r.review.rating,
    body: r.review.body,
    isVerified: r.review.isVerified,
    createdAt: r.review.createdAt,
    user: { id: r.review.userId, name: r.userName },
  }))

  return {
    ...summaries[0],
    description: row.description,
    phone: row.phone,
    whatsapp: row.whatsapp,
    website: row.website,
    openingHours: row.openingHours as Record<string, string> | null,
    reviews,
  }
}

// --- FLASH DEALS ---
export async function getActiveFlashDeals(
  lat: number,
  lng: number,
  userCoins: number,
): Promise<Array<FlashDeal & { partner: PartnerSummary }>> {
  const now = new Date()

  const rows = await db
    .select({ deal: flashDeals, partner: partners })
    .from(flashDeals)
    .innerJoin(partners, eq(partners.id, flashDeals.partnerId))
    .where(
      and(
        eq(flashDeals.isActive, true),
        lte(flashDeals.startsAt, now),
        gte(flashDeals.expiresAt, now),
        eq(partners.isActive, true),
        eq(partners.isApproved, true),
        sql`${userCoins} >= ${flashDeals.minCoins}`,
        sql`${haversineMeters(partners.lat, partners.lng, lat, lng)} <= ${flashDeals.radiusMeters}`,
      ),
    )
    .orderBy(asc(flashDeals.expiresAt))

  if (rows.length === 0) return []

  const partnerSummaries = await attachRatings(rows.map((r) => r.partner))
  const summaryMap = Object.fromEntries(partnerSummaries.map((p) => [p.id, p]))

  return rows.map((r) => ({
    ...r.deal,
    partner: summaryMap[r.partner.id],
  }))
}

type FlashDeal = typeof flashDeals.$inferSelect

// --- REVIEWS ---
// Check if user has a capture within 2km of partner in last 12 months
// Uses bounding-box pre-filter + Haversine (avoids PostGIS geography cast)
async function isVerifiedVisitor(userId: string, partnerLat: number, partnerLng: number): Promise<boolean> {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // ~2km bounding box in degrees (1 deg lat ≈ 111km)
  const latDelta = 2000 / 111000
  const lngDelta = 2000 / (111000 * Math.cos((partnerLat * Math.PI) / 180))

  const result = await db
    .select({ id: captures.id })
    .from(captures)
    .where(
      and(
        eq(captures.userId, userId),
        gte(captures.capturedAt, oneYearAgo),
        // Bounding box pre-filter
        sql`${captures.lat} BETWEEN ${partnerLat - latDelta} AND ${partnerLat + latDelta}`,
        sql`${captures.lng} BETWEEN ${partnerLng - lngDelta} AND ${partnerLng + lngDelta}`,
        // Haversine exact check (metres)
        sql`(
          6371000 * acos(
            cos(radians(${partnerLat})) * cos(radians(${captures.lat})) *
            cos(radians(${captures.lng}) - radians(${partnerLng})) +
            sin(radians(${partnerLat})) * sin(radians(${captures.lat}))
          )
        ) <= 2000`,
      ),
    )
    .limit(1)

  return result.length > 0
}

export async function createReview(
  userId: string,
  partnerId: string,
  rating: number,
  body: string | null,
): Promise<{ success: boolean; isVerified: boolean }> {
  const [partner] = await db
    .select({ lat: partners.lat, lng: partners.lng })
    .from(partners)
    .where(eq(partners.id, partnerId))
    .limit(1)

  if (!partner) throw new Error('Partner not found')

  const isVerified = await isVerifiedVisitor(userId, partner.lat, partner.lng)

  await db
    .insert(partnerReviews)
    .values({ partnerId, userId, rating, body, isVerified })
    .onConflictDoUpdate({
      target: [partnerReviews.partnerId, partnerReviews.userId],
      set: { rating, body, isVerified },
    })

  return { success: true, isVerified }
}

// --- CONTACT CLICK (analytics for Premium partners) ---
export async function logContactClick(_partnerId: string): Promise<void> {
  // Future: insert into partner_contact_events for analytics dashboard
  // No-op for now — placeholder for Premium analytics
}
