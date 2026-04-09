import { pgTable, text, doublePrecision, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { places } from './places'

export const userPlaces = pgTable('user_places', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  placeId: text('place_id').references(() => places.id).notNull(),
  photoUrl: text('photo_url'),
  note: text('note'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  coinsEarned: integer('coins_earned').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
}, (t) => [
  unique('user_place_unique').on(t.userId, t.placeId),
])

export type UserPlace = typeof userPlaces.$inferSelect
export type NewUserPlace = typeof userPlaces.$inferInsert
