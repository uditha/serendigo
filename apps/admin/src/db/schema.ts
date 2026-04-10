import {
  pgTable, text, boolean, integer, doublePrecision, timestamp, jsonb
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  serendipityCoins: integer('serendipity_coins').default(0),
  travellerCharacter: text('traveller_character'),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const captures = pgTable('captures', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  chapterId: text('chapter_id').notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
})

export type Arc = typeof arcs.$inferSelect
export type Chapter = typeof chapters.$inferSelect
