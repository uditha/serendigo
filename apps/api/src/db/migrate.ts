import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

const client = postgres(process.env.DATABASE_URL as string, { prepare: false })
const db = drizzle(client)

migrate(db, { migrationsFolder: 'src/db/migrations' })
  .then(() => {
    console.log('Migrations applied successfully')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Migration failed:', err.message)
    process.exit(1)
  })
