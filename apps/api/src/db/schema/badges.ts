import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'

export const badges = pgTable('badges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  conditionType: text('condition_type').notNull(),
  conditionValue: text('condition_value').notNull(),
})

export const userBadges = pgTable('user_badges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  badgeId: text('badge_id').references(() => badges.id).notNull(),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.userId, t.badgeId),
])

export type Badge = typeof badges.$inferSelect
export type UserBadge = typeof userBadges.$inferSelect
