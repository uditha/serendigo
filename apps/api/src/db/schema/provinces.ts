import { pgTable, text } from 'drizzle-orm/pg-core'

export const provinces = pgTable('provinces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  stampDesignKey: text('stamp_design_key'),
  fillColor: text('fill_color'),
  // polygon (PostGIS geometry) added in a later migration once PostGIS is enabled
})

export type Province = typeof provinces.$inferSelect
export type NewProvince = typeof provinces.$inferInsert
