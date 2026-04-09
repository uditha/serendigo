import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL as string, { prepare: false })

await client`DELETE FROM drizzle.__drizzle_migrations`
console.log('Cleared drizzle migrations table')
await client.end()
process.exit(0)
