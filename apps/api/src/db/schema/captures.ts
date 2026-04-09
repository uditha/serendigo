import { pgTable, text, doublePrecision, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { chapters } from './chapters'

export const captures = pgTable('captures', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  chapterId: text('chapter_id').references(() => chapters.id).notNull(),
  photoUrl: text('photo_url').notNull(),
  note: text('note'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  coinsEarned: integer('coins_earned').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
})

export type Capture = typeof captures.$inferSelect
export type NewCapture = typeof captures.$inferInsert
