import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  // Better Auth required fields
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  name: text('name'),
  image: text('image'), // Better Auth uses 'image' (profile photo URL)

  // Game profile
  travellerCharacter: text('traveller_character'),

  // XP per world type
  tasteXP: integer('taste_xp').default(0).notNull(),
  wildXP: integer('wild_xp').default(0).notNull(),
  moveXP: integer('move_xp').default(0).notNull(),
  rootsXP: integer('roots_xp').default(0).notNull(),
  restoreXP: integer('restore_xp').default(0).notNull(),

  // Gamification
  serendipityCoins: integer('serendipity_coins').default(0).notNull(),
  level: integer('level').default(1).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
