import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { arcs } from './arcs'

export const userArcs = pgTable('user_arcs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  arcId: text('arc_id').references(() => arcs.id, { onDelete: 'cascade' }).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (t) => [
  unique('user_arc_unique').on(t.userId, t.arcId),
])

export type UserArc = typeof userArcs.$inferSelect
export type NewUserArc = typeof userArcs.$inferInsert
