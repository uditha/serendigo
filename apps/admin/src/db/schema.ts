import {
  pgTable, text, boolean, integer, doublePrecision, timestamp, jsonb, primaryKey, unique
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  serendipityCoins: integer('serendipity_coins').default(0),
  travellerCharacter: text('traveller_character'),
  pushToken: text('push_token'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const arcs = pgTable('arcs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  worldType: text('world_type').notNull(),
  province: text('province').notNull(),
  narratorName: text('narrator_name'),
  introText: text('intro_text'),
  coverImage: text('cover_image'),
  seasonStart: integer('season_start'),
  seasonEnd: integer('season_end'),
  isSeasonal: boolean('is_seasonal').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  creatorId: text('creator_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const chapters = pgTable('chapters', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  arcId: text('arc_id').notNull(),
  order: integer('order').notNull(),
  title: text('title').notNull(),
  loreText: text('lore_text'),
  beforeYouGo: jsonb('before_you_go'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  radiusMeters: integer('radius_meters').default(200).notNull(),
  coinReward: integer('coin_reward').default(50).notNull(),
  xpCategory: text('xp_category').notNull(),
  coverImage: text('cover_image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const captures = pgTable('captures', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  chapterId: text('chapter_id').notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
})

export const partners = pgTable('partners', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  address: text('address'),
  district: text('district'),
  province: text('province').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  website: text('website'),
  tier: text('tier').notNull().default('listed'),
  photos: text('photos').array().notNull().default([]),
  openingHours: jsonb('opening_hours'),
  priceMin: integer('price_min'),
  priceMax: integer('price_max'),
  tags: text('tags').array().notNull().default([]),
  isLocal: boolean('is_local').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  isApproved: boolean('is_approved').notNull().default(false),
  coinBalance: integer('coin_balance').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const chapterFeaturedPartners = pgTable('chapter_featured_partners', {
  chapterId: text('chapter_id').notNull(),
  partnerId: text('partner_id').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.chapterId, t.partnerId] }),
])

export const flashDeals = pgTable('flash_deals', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  discountText: text('discount_text').notNull(),
  claimCode: text('claim_code').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  radiusMeters: integer('radius_meters').notNull().default(1500),
  minCoins: integer('min_coins').notNull().default(200),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const partnerReviews = pgTable('partner_reviews', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull(),
  userId: text('user_id').notNull(),
  rating: integer('rating').notNull(),
  body: text('body'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const coinOffers = pgTable('coin_offers', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull(),
  label: text('label').notNull(),
  coinsRequired: integer('coins_required').notNull(),
  discountPercent: integer('discount_percent').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const coinRedemptions = pgTable('coin_redemptions', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull(),
  userId: text('user_id').notNull(),
  offerId: text('offer_id').notNull(),
  coinsSpent: integer('coins_spent').notNull(),
  discountPercent: integer('discount_percent').notNull(),
  confirmationCode: text('confirmation_code').notNull(),
  redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
})

// ─── Creators (editorial partner applications) ────────────────────────────
export const creators = pgTable('creators', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  slug: text('slug').notNull(),
  bio: text('bio'),
  photo: text('photo'),
  province: text('province'),
  instagram: text('instagram'),
  website: text('website'),
  status: text('status').notNull().default('pending'), // pending | approved | rejected | suspended
  applicationNote: text('application_note'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
})

export const arcSubmissions = pgTable('arc_submissions', {
  id: text('id').primaryKey(),
  creatorId: text('creator_id').notNull(),
  title: text('title').notNull(),
  tagline: text('tagline'),
  worldType: text('world_type').notNull(),
  province: text('province').notNull(),
  narrativeHook: text('narrative_hook'),
  coverImage: text('cover_image'),
  chapters: jsonb('chapters').notNull().default([]),
  status: text('status').notNull().default('draft'), // draft | submitted | approved | rejected | published
  adminFeedback: text('admin_feedback'),
  publishedArcId: text('published_arc_id'),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Arc = typeof arcs.$inferSelect
export type Chapter = typeof chapters.$inferSelect
export type Partner = typeof partners.$inferSelect
export type FlashDeal = typeof flashDeals.$inferSelect
export type CoinOffer = typeof coinOffers.$inferSelect
export type CoinRedemption = typeof coinRedemptions.$inferSelect
export type Creator = typeof creators.$inferSelect
export type ArcSubmission = typeof arcSubmissions.$inferSelect
