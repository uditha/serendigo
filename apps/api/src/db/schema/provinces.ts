import { pgTable, text, customType } from 'drizzle-orm/pg-core'

// PostGIS geometry column (Supabase has PostGIS enabled by default)
const geometry = customType<{ data: string }>({
  dataType() {
    return 'geometry(Polygon,4326)'
  },
})

export const provinces = pgTable('provinces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  stampDesignKey: text('stamp_design_key'),
  fillColor: text('fill_color'),
  polygon: geometry('polygon'),
})

export type Province = typeof provinces.$inferSelect
export type NewProvince = typeof provinces.$inferInsert
