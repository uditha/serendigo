import postgres from 'postgres'

const email = process.argv[2]
if (!email) {
  console.error('Usage: bun run src/db/reset-user-data.ts <email>')
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
console.log(`Resetting data for ${email} (id: ${userId})...`)

await client`DELETE FROM user_badges WHERE user_id = ${userId}`
await client`DELETE FROM captures WHERE user_id = ${userId}`
await client`DELETE FROM user_arcs WHERE user_id = ${userId}`
await client`
  UPDATE "user" SET
    serendipity_coins = 0,
    taste_xp = 0,
    wild_xp = 0,
    move_xp = 0,
    roots_xp = 0,
    restore_xp = 0
  WHERE id = ${userId}
`

console.log('✓ Cleared: captures, enrollments, badges')
console.log('✓ Reset: coins, XP to 0')
await client.end()
process.exit(0)
