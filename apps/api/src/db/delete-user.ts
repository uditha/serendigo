import postgres from 'postgres'

const email = process.argv[2]
if (!email) {
  console.error('Usage: bun run src/db/delete-user.ts <email>')
  process.exit(1)
}

const client = postgres(process.env.DATABASE_URL as string, { prepare: false })

const users = await client`SELECT id FROM "user" WHERE email = ${email}`
if (users.length === 0) {
  console.log(`No user found with email: ${email}`)
  await client.end()
  process.exit(0)
}

const userId = users[0].id
await client`DELETE FROM "session" WHERE user_id = ${userId}`
await client`DELETE FROM "account" WHERE user_id = ${userId}`
await client`DELETE FROM "user" WHERE id = ${userId}`

console.log(`✓ Deleted user ${email} (id: ${userId})`)
await client.end()
process.exit(0)
