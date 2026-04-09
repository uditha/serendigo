import { pgTable, text } from 'drizzle-orm/pg-core'

export const districts = pgTable('districts', {
  id: text('id').primaryKey(),   // e.g. "colombo"
  name: text('name').notNull(),  // e.g. "Colombo"
  slug: text('slug').notNull().unique(),
  province: text('province').notNull(), // e.g. "western"
})

export type District = typeof districts.$inferSelect
export type NewDistrict = typeof districts.$inferInsert
