import { relations } from 'drizzle-orm'
import { users } from './users'
import { arcs } from './arcs'
import { places } from './places'
import { arcPlaces } from './arc_places'
import { userPlaces } from './user_places'
import { userArcs } from './user_arcs'

export const usersRelations = relations(users, ({ many }) => ({
  userPlaces: many(userPlaces),
  userArcs: many(userArcs),
}))

export const arcsRelations = relations(arcs, ({ many }) => ({
  arcPlaces: many(arcPlaces),
  userArcs: many(userArcs),
}))

export const placesRelations = relations(places, ({ many }) => ({
  arcPlaces: many(arcPlaces),
  userPlaces: many(userPlaces),
}))

export const arcPlacesRelations = relations(arcPlaces, ({ one }) => ({
  arc: one(arcs, { fields: [arcPlaces.arcId], references: [arcs.id] }),
  place: one(places, { fields: [arcPlaces.placeId], references: [places.id] }),
}))

export const userPlacesRelations = relations(userPlaces, ({ one }) => ({
  user: one(users, { fields: [userPlaces.userId], references: [users.id] }),
  place: one(places, { fields: [userPlaces.placeId], references: [places.id] }),
}))

export const userArcsRelations = relations(userArcs, ({ one }) => ({
  user: one(users, { fields: [userArcs.userId], references: [users.id] }),
  arc: one(arcs, { fields: [userArcs.arcId], references: [arcs.id] }),
}))
