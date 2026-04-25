import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

/**
 * Creators — external content contributors who build arcs for SerendiGO.
 * Separate from `user` (travellers) and admin (ops team).
 * Approval-gated: apply → admin reviews → approved → can submit arcs.
 */
export const creators = pgTable('creators', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),            // set only after approval
  slug: text('slug').notNull().unique(),          // URL-safe, for /creators/[slug]
  bio: text('bio'),
  photo: text('photo'),                           // R2 URL
  province: text('province'),                     // their home base
  instagram: text('instagram'),                   // handle without @
  website: text('website'),
  status: text('status', {
    enum: ['pending', 'approved', 'rejected', 'suspended'],
  }).notNull().default('pending'),
  applicationNote: text('application_note'),     // sample arc concept from application
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
})

/**
 * Arc submissions — drafts/submissions from creators, reviewed by admin.
 * Once approved, admin publishes and links back via `publishedArcId`.
 * Chapters live inline as JSON until published (then split into `chapters` table).
 */
export const arcSubmissions = pgTable('arc_submissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  creatorId: text('creator_id').notNull().references(() => creators.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  tagline: text('tagline'),
  worldType: text('world_type', {
    enum: ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'],
  }).notNull(),
  province: text('province', {
    enum: ['WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
           'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA'],
  }).notNull(),
  narrativeHook: text('narrative_hook'),
  coverImage: text('cover_image'),
  // chapters: [{ title, task, lore, lat, lng, coverImage, coinReward, xpCategory }]
  chapters: jsonb('chapters').notNull().default([]),
  status: text('status', {
    enum: ['draft', 'submitted', 'approved', 'rejected', 'published'],
  }).notNull().default('draft'),
  adminFeedback: text('admin_feedback'),
  publishedArcId: text('published_arc_id'),     // set when admin publishes
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Creator = typeof creators.$inferSelect
export type NewCreator = typeof creators.$inferInsert
export type ArcSubmission = typeof arcSubmissions.$inferSelect
export type NewArcSubmission = typeof arcSubmissions.$inferInsert
