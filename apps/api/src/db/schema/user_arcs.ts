import { pgTable, text, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { arcs } from './arcs'

export const userArcs = pgTable('user_arcs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  arcId: text('arc_id').references(() => arcs.id, { onDelete: 'cascade' }).notNull(),
  status: text('status', {
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
  }).default('NOT_STARTED').notNull(),
  placesCompleted: integer('places_completed').default(0).notNull(),
  bonusClaimed: boolean('bonus_claimed').default(false).notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
}, (t) => [
  unique('user_arc_unique').on(t.userId, t.arcId),
])

export type UserArc = typeof userArcs.$inferSelect
export type NewUserArc = typeof userArcs.$inferInsert
