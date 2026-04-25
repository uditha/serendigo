import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import * as schema from '../db/schema'

/** Mobile sets `Origin` to EXPO_PUBLIC_API_URL (often LAN). Always trust the public API URL(s). */
function buildTrustedOrigins(): string[] {
  const fromEnv = (process.env.TRUSTED_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  const sameAsApi = [process.env.BETTER_AUTH_URL, process.env.API_BASE_URL]
    .filter((x): x is string => Boolean(x?.trim()))
    .map((x) => x.trim())
  return [...new Set([...fromEnv, ...sameAsApi])]
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  secret: (() => {
    const s = process.env.BETTER_AUTH_SECRET
    if (!s) throw new Error('BETTER_AUTH_SECRET env var is required')
    return s
  })(),
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  trustedOrigins: buildTrustedOrigins(),

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
