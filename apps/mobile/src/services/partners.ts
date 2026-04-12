import { fetchFromApi } from './api'

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
  isLocal: boolean
}

export interface ReviewItem {
  id: string
  rating: number
  body: string | null
  isVerified: boolean
  createdAt: string
  user: { id: string; name: string | null }
}

export interface PartnerDetail extends PartnerSummary {
  description: string
  phone: string | null
  whatsapp: string | null
  website: string | null
  openingHours: Record<string, string> | null
  reviews: ReviewItem[]
}

export interface FlashDeal {
  id: string
  partnerId: string
  title: string
  description: string | null
  discountText: string
  claimCode: string
  startsAt: string
  expiresAt: string
  radiusMeters: number
  minCoins: number
  partner: PartnerSummary
}

export interface ChapterPartners {
  featured: PartnerSummary[]
  nearby: PartnerSummary[]
}

export function getChapterPartners(chapterId: string, lat: number, lng: number) {
  return fetchFromApi<{ success: boolean; data: ChapterPartners }>(
    `/api/partners/chapter/${chapterId}?lat=${lat}&lng=${lng}`
  ).then((r) => r.data)
}

export function getProvincePartners(province: string, category?: string) {
  const qs = category ? `?category=${category}` : ''
  return fetchFromApi<{ success: boolean; data: Record<string, PartnerSummary[]> }>(
    `/api/partners/province/${province}${qs}`
  ).then((r) => r.data)
}

export function getPartnerById(id: string) {
  return fetchFromApi<{ success: boolean; data: PartnerDetail }>(
    `/api/partners/${id}`
  ).then((r) => r.data)
}

export function getFlashDeals(lat: number, lng: number) {
  return fetchFromApi<{ success: boolean; data: FlashDeal[] }>(
    `/api/partners/flash-deals?lat=${lat}&lng=${lng}`
  ).then((r) => r.data)
}

export function submitReview(partnerId: string, rating: number, body?: string) {
  return fetchFromApi<{ success: boolean; data: { isVerified: boolean } }>(
    `/api/partners/${partnerId}/reviews`,
    { method: 'POST', body: JSON.stringify({ rating, body }) }
  )
}

export function logContactClick(partnerId: string) {
  return fetchFromApi(`/api/partners/${partnerId}/contact-click`, { method: 'POST' }).catch(() => {})
}
