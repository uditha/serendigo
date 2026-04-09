import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Game-specific fields on the user record
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
