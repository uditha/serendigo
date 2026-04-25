import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import * as relations from './relations'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl?.trim()) {
  throw new Error('DATABASE_URL is missing or empty — set it in apps/api/.env')
}

// Transaction pooler (port 6543 / pooler host) disallows prepared statements.
// Direct Postgres (e.g. db.<ref>.supabase.co:5432) supports prepare: true.
const usePgBouncer =
  databaseUrl.includes('pooler.supabase.com') ||
  /(?:^|[?&])pgbouncer=true(?:&|$)/i.test(databaseUrl)

const client = postgres(databaseUrl, {
  prepare: !usePgBouncer,
  connect_timeout: 60,
})

export const db = drizzle(client, { schema: { ...schema, ...relations } })
