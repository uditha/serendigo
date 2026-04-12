import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'
import { chapters } from './chapters'

export type PartnerCategory = 'FOOD' | 'STAY' | 'EXPERIENCE' | 'SHOP' | 'TRANSPORT'
export type PartnerTier = 'listed' | 'partner' | 'premium'

export interface OpeningHours {
  mon?: string
  tue?: string
  wed?: string
  thu?: string
  fri?: string
  sat?: string
  sun?: string
  note?: string // e.g. "Closed during Poya holidays"
}

export const partners = pgTable('partners', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  category: text('category', {
    enum: ['FOOD', 'STAY', 'EXPERIENCE', 'SHOP', 'TRANSPORT'],
  }).notNull(),
  tagline: text('tagline').notNull(),       // 40 chars — shown on compact card
  description: text('description').notNull(), // 150 chars — shown on detail
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  address: text('address'),
  district: text('district'),
  province: text('province').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  website: text('website'),
  tier: text('tier', {
    enum: ['listed', 'partner', 'premium'],
  }).notNull().default('listed'),
  photos: text('photos').array().notNull().default([]),
  openingHours: jsonb('opening_hours').$type<OpeningHours>(),
  priceMin: integer('price_min'),   // USD
  priceMax: integer('price_max'),   // USD
  tags: text('tags').array().notNull().default([]),
  isLocal: boolean('is_local').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  isApproved: boolean('is_approved').notNull().default(false),
  coinBalance: integer('coin_balance').notNull().default(0), // coins collected from travelers
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Editorial picks — admin curates which partners appear first on a chapter
export const chapterFeaturedPartners = pgTable('chapter_featured_partners', {
  chapterId: text('chapter_id').references(() => chapters.id, { onDelete: 'cascade' }).notNull(),
  partnerId: text('partner_id').references(() => partners.id, { onDelete: 'cascade' }).notNull(),
  displayOrder: integer('display_order').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.chapterId, t.partnerId] }),
])

// Time-limited deals for Premium partners
export const flashDeals = pgTable('flash_deals', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  partnerId: text('partner_id').references(() => partners.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  discountText: text('discount_text').notNull(), // "20% off lunch"
  claimCode: text('claim_code').notNull(),        // shown to user at counter
  startsAt: timestamp('starts_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  radiusMeters: integer('radius_meters').notNull().default(1500),
  minCoins: integer('min_coins').notNull().default(200),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Reviews — one per user per partner, verified via capture history
export const partnerReviews = pgTable('partner_reviews', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  partnerId: text('partner_id').references(() => partners.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),  // 1–5
  body: text('body'),                    // optional text
  isVerified: boolean('is_verified').notNull().default(false), // capture within 2km in last 12mo
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique('one_review_per_user').on(t.partnerId, t.userId),
])

// Coin offers — partner sets what travelers can redeem
export const coinOffers = pgTable('coin_offers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  partnerId: text('partner_id').references(() => partners.id, { onDelete: 'cascade' }).notNull(),
  label: text('label').notNull(),              // "10% off any purchase"
  coinsRequired: integer('coins_required').notNull(),  // 100
  discountPercent: integer('discount_percent').notNull(), // 10
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Coin redemptions — log of every coin exchange
export const coinRedemptions = pgTable('coin_redemptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  partnerId: text('partner_id').references(() => partners.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  offerId: text('offer_id').references(() => coinOffers.id, { onDelete: 'restrict' }).notNull(),
  coinsSpent: integer('coins_spent').notNull(),
  discountPercent: integer('discount_percent').notNull(),
  confirmationCode: text('confirmation_code').notNull(), // 6-char code shown to cashier
  redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
})

export type Partner = typeof partners.$inferSelect
export type NewPartner = typeof partners.$inferInsert
export type FlashDeal = typeof flashDeals.$inferSelect
export type PartnerReview = typeof partnerReviews.$inferSelect
export type CoinOffer = typeof coinOffers.$inferSelect
export type CoinRedemption = typeof coinRedemptions.$inferSelect
