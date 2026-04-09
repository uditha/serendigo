import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import * as schema from '../db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET ?? 'dev-secret-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,  // allow login without verifying email
  },

  user: {
    additionalFields: {
      serendipityCoins: { type: 'number', defaultValue: 0 },
      level: { type: 'number', defaultValue: 1 },
      tasteXP: { type: 'number', defaultValue: 0 },
      wildXP: { type: 'number', defaultValue: 0 },
      moveXP: { type: 'number', defaultValue: 0 },
      rootsXP: { type: 'number', defaultValue: 0 },
      restoreXP: { type: 'number', defaultValue: 0 },
      travellerCharacter: { type: 'string', required: false },
    },
  },
})
