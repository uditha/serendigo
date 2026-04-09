import { pgTable, text, integer, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { arcs } from './arcs'
import { places } from './places'

export const arcPlaces = pgTable('arc_places', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  arcId: text('arc_id').references(() => arcs.id, { onDelete: 'cascade' }).notNull(),
  placeId: text('place_id').references(() => places.id, { onDelete: 'cascade' }).notNull(),
  order: integer('order').notNull(),
  transitionText: text('transition_text'), // "After your tea, walk 10 minutes to..."
  customLoreText: text('custom_lore_text'), // override lore in this arc's context
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique('arc_place_unique').on(t.arcId, t.placeId),
])

export type ArcPlace = typeof arcPlaces.$inferSelect
export type NewArcPlace = typeof arcPlaces.$inferInsert
