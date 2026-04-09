import { pgTable, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'

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
  narratorName: text('narrator_name'),
  introText: text('intro_text'),
  coverImage: text('cover_image'),
  seasonStart: integer('season_start'), // month 1-12
  seasonEnd: integer('season_end'),     // month 1-12
  isSeasonal: boolean('is_seasonal').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  authorUserId: text('author_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Arc = typeof arcs.$inferSelect
export type NewArc = typeof arcs.$inferInsert
