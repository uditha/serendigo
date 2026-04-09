import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'),
  profileImage: text('profile_image'),
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

  // OAuth
  googleId: text('google_id'),
  appleId: text('apple_id'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
