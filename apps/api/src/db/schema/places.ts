import { pgTable, text, doublePrecision, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const places = pgTable('places', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  // Identity
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),

  // Location
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  province: text('province', {
    enum: ['WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
           'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA'],
  }).notNull(),
  address: text('address'),

  // Classification
  // Open text — common values: 'temple', 'tea', 'beach', 'viewpoint', 'hotel',
  //   'transport', 'experience', 'restaurant', 'factory', 'guide', 'market'
  worldType: text('world_type', {
    enum: ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'],
  }).notNull(),
  category: text('category').notNull(),
  tags: text('tags').array(),
  tier: integer('tier').default(2).notNull(), // 1=Signature, 2=Essential, 3=Deep Cut

  // Content
  loreText: text('lore_text'), // revealed after capture
  beforeYouGo: jsonb('before_you_go').$type<{
    bestTime?: string
    dresscode?: string
    entryFee?: string
    priceRange?: string    // e.g. "2,000–3,500 LKR half/full day"
    etiquette?: string
    bookingRequired?: boolean
  }>(),
  coverImage: text('cover_image'),

  // Contact (for service providers: tuk drivers, guides, hotels, experiences)
  contactInfo: jsonb('contact_info').$type<{
    phone?: string
    whatsapp?: string
    website?: string
    instagram?: string
  }>(),

  // Operating hours (optional — for businesses, not natural sites)
  operatingHours: jsonb('operating_hours').$type<{
    monday?: string     // e.g. "6am – 6pm"
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
    note?: string       // e.g. "Closed on Poya days"
  }>(),

  // Service area (for transport/guides — "Sigiriya, Dambulla, Polonnaruwa")
  serviceArea: text('service_area'),

  // Gamification
  coinReward: integer('coin_reward').default(50).notNull(),
  xpCategory: text('xp_category', {
    enum: ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'],
  }).notNull(),

  // Practical
  isQuickStop: boolean('is_quick_stop').default(false).notNull(),
  estimatedMinutes: integer('estimated_minutes'),

  // Status
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Place = typeof places.$inferSelect
export type NewPlace = typeof places.$inferInsert
