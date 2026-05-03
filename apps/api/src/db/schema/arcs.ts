import { pgTable, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'

export const arcs = pgTable('arcs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  worldType: text('world_type', {
    enum: ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'],
  }).notNull(),
  province: text('province', {
    enum: ['WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
           'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA'],
  }).notNull(),
  district: text('district'),
  narratorName: text('narrator_name'),
  introText: text('intro_text'),
  coverImage: text('cover_image'),
  seasonStart: integer('season_start'), // month 1-12
  seasonEnd: integer('season_end'),     // month 1-12
  isSeasonal: boolean('is_seasonal').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  authorUserId: text('author_user_id').references(() => user.id),
  creatorId: text('creator_id'),  // FK to creators.id — null for official SerendiGO arcs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Arc = typeof arcs.$inferSelect
export type NewArc = typeof arcs.$inferInsert
