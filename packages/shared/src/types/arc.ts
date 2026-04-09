import type { WorldType, Province } from './world'

// ─── Shared JSON shapes ───────────────────────────────────────────────────────

export interface BeforeYouGo {
  bestTime?: string
  dresscode?: string
  entryFee?: string
  priceRange?: string
  etiquette?: string
  bookingRequired?: boolean
}

export interface ContactInfo {
  phone?: string
  whatsapp?: string
  website?: string
  instagram?: string
}

export interface OperatingHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
  note?: string
}

// ─── Place ────────────────────────────────────────────────────────────────────
// The atomic unit — every capturable location or service provider in Sri Lanka.
// category examples: 'temple', 'tea', 'beach', 'viewpoint', 'hotel',
//                    'transport', 'experience', 'restaurant', 'guide', 'market'

export interface Place {
  id: string
  slug: string
  title: string
  description?: string | null

  // Location
  lat: number
  lng: number
  province: Province
  address?: string | null

  // Classification
  worldType: WorldType
  category: string
  tags?: string[] | null
  tier: number // 1=Signature, 2=Essential, 3=Deep Cut

  // Content
  loreText?: string | null    // revealed after capture
  beforeYouGo?: BeforeYouGo | null
  coverImage?: string | null

  // Service provider fields (transport, guides, hotels)
  contactInfo?: ContactInfo | null
  operatingHours?: OperatingHours | null
  serviceArea?: string | null // "Sigiriya, Dambulla, Polonnaruwa"

  // Gamification
  coinReward: number
  xpCategory: WorldType

  // Practical
  isQuickStop: boolean
  estimatedMinutes?: number | null

  isPublished: boolean
  createdAt: string
  updatedAt: string
}

// ─── Arc ──────────────────────────────────────────────────────────────────────
// A curated journey connecting Places into a narrative.

export interface ArcPlace {
  place: Place
  order: number
  transitionText?: string | null  // "After your tea, walk 10 minutes to..."
  customLoreText?: string | null  // override for this arc context
}

export interface Arc {
  id: string
  slug: string
  title: string
  worldType: WorldType
  province: Province
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING'

  // Narrator / local guide voice
  narratorName?: string | null
  narratorBio?: string | null
  narratorImage?: string | null

  introText?: string | null
  outroText?: string | null

  hiddenGem?: {
    placeId: string
    revealText: string
  } | null

  minDays: number
  coverImage?: string | null

  isSeasonal: boolean
  seasonStart?: number | null // month 1–12
  seasonEnd?: number | null

  completionBonus: number
  isPublished: boolean

  // Populated when fetched with places
  places?: ArcPlace[]
  isActiveNow?: boolean

  createdAt: string
  updatedAt: string
}

// ─── User progress ────────────────────────────────────────────────────────────

export interface UserPlace {
  id: string
  userId: string
  placeId: string
  photoUrl?: string | null
  note?: string | null
  lat?: number | null
  lng?: number | null
  coinsEarned: number
  isPublic: boolean
  capturedAt: string
}

export interface UserArcProgress {
  arcId: string
  userId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  placesCompleted: number
  totalPlaces: number
  capturedPlaceIds: string[]
  bonusClaimed: boolean
  startedAt?: string | null
  completedAt?: string | null
}
