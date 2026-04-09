import { pgTable, text, boolean, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'

export const arcs = pgTable('arcs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  // Identity
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),

  // Classification
  worldType: text('world_type', {
    enum: ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'],
  }).notNull(),
  province: text('province', {
    enum: ['WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
           'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA'],
  }).notNull(),
  difficulty: text('difficulty', {
    enum: ['EASY', 'MODERATE', 'CHALLENGING'],
  }).default('MODERATE').notNull(),

  // Narrator
  narratorName: text('narrator_name'),
  narratorBio: text('narrator_bio'),
  narratorImage: text('narrator_image'),

  // Story
  introText: text('intro_text'),
  outroText: text('outro_text'), // shown after arc completion

  // Hidden gem unlocked on completion
  hiddenGem: jsonb('hidden_gem').$type<{
    placeId: string
    revealText: string
  }>(),

  // Practical
  minDays: integer('min_days').default(1).notNull(),
  coverImage: text('cover_image'),

  // Seasonal
  isSeasonal: boolean('is_seasonal').default(false).notNull(),
  seasonStart: integer('season_start'), // month 1-12
  seasonEnd: integer('season_end'),     // month 1-12

  // Gamification
  completionBonus: integer('completion_bonus').default(100).notNull(),

  // Status
  isPublished: boolean('is_published').default(false).notNull(),
  authorUserId: text('author_user_id').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Arc = typeof arcs.$inferSelect
export type NewArc = typeof arcs.$inferInsert
