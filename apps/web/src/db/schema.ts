// Mirror of API schema — only the tables this portal needs.
// Source of truth is apps/api/src/db/schema. Keep in sync manually.
import {
  pgTable, text, boolean, integer, timestamp, jsonb,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// ─── Creators (auth-owning table) ─────────────────────────────────────────
export const creators = pgTable('creators', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  slug: text('slug').notNull().unique(),
  bio: text('bio'),
  photo: text('photo'),
  googleId: text('google_id').unique(),
  province: text('province'),
  instagram: text('instagram'),
  website: text('website'),
  status: text('status').notNull().default('pending'),
  applicationNote: text('application_note'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
})

// ─── Arc submissions ──────────────────────────────────────────────────────
export const arcSubmissions = pgTable('arc_submissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  creatorId: text('creator_id').notNull(),
  title: text('title').notNull(),
  tagline: text('tagline'),
  worldType: text('world_type').notNull(),
  province: text('province').notNull(),
  narrativeHook: text('narrative_hook'),
  coverImage: text('cover_image'),
  chapters: jsonb('chapters').notNull().default([]),
  status: text('status').notNull().default('draft'),
  adminFeedback: text('admin_feedback'),
  publishedArcId: text('published_arc_id'),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Arcs (read-only from here; source in api) ───────────────────────────
export const arcs = pgTable('arcs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  worldType: text('world_type').notNull(),
  province: text('province').notNull(),
  coverImage: text('cover_image'),
  isPublished: boolean('is_published').notNull().default(false),
  creatorId: text('creator_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Creator = typeof creators.$inferSelect
export type ArcSubmission = typeof arcSubmissions.$inferSelect
export type Arc = typeof arcs.$inferSelect

// Chapter shape stored inside arcSubmissions.chapters JSONB
export interface ChapterDraft {
  title: string
  task: string
  lore?: string
  lat: number
  lng: number
  coverImage?: string
  coinReward?: number
  xpCategory?: string
}
