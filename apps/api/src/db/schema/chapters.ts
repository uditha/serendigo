import { pgTable, text, integer, doublePrecision, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { arcs } from './arcs'

export interface BeforeYouGo {
  bestTime?: string
  dresscode?: string
  entryFee?: string
  etiquette?: string
}

export const chapters = pgTable('chapters', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  arcId: text('arc_id').references(() => arcs.id, { onDelete: 'cascade' }).notNull(),
  order: integer('order').notNull(),
  title: text('title').notNull(),
  loreText: text('lore_text'), // revealed after capture
  beforeYouGo: jsonb('before_you_go').$type<BeforeYouGo>(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  radiusMeters: integer('radius_meters').default(200).notNull(),
  coinReward: integer('coin_reward').default(50).notNull(),
  xpCategory: text('xp_category', {
    enum: ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'],
  }).notNull(),
  coverImage: text('cover_image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Chapter = typeof chapters.$inferSelect
export type NewChapter = typeof chapters.$inferInsert
