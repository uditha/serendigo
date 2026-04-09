import { relations } from 'drizzle-orm'
import { arcs } from './schema/arcs'
import { chapters } from './schema/chapters'
import { userArcs } from './schema/user_arcs'
import { captures } from './schema/captures'
import { user } from './schema/auth'

export const arcsRelations = relations(arcs, ({ many }) => ({
  chapters: many(chapters),
  userArcs: many(userArcs),
}))

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  arc: one(arcs, { fields: [chapters.arcId], references: [arcs.id] }),
  captures: many(captures),
}))

export const userArcsRelations = relations(userArcs, ({ one }) => ({
  user: one(user, { fields: [userArcs.userId], references: [user.id] }),
  arc: one(arcs, { fields: [userArcs.arcId], references: [arcs.id] }),
}))

export const capturesRelations = relations(captures, ({ one }) => ({
  user: one(user, { fields: [captures.userId], references: [user.id] }),
  chapter: one(chapters, { fields: [captures.chapterId], references: [chapters.id] }),
}))
