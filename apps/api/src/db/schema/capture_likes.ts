import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'
import { captures } from './captures'

export const captureLikes = pgTable('capture_likes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  captureId: text('capture_id').references(() => captures.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique('capture_like_unique').on(t.userId, t.captureId),
])

export type CaptureLike = typeof captureLikes.$inferSelect
