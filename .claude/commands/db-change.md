# /db-change

Make a Drizzle schema change and generate a safe migration.

## ⚠️ CRITICAL: Database Changes Are Dangerous

Before ANY schema change:
1. Read the current schema completely
2. Understand what data exists
3. Consider breaking changes
4. Plan rollback strategy

## Process

### Step 1: Read Current Schema
```bash
# First, show me what exists
cat apps/api/src/db/schema/*.ts
```

### Step 2: Make Schema Change
Edit the appropriate schema file in `apps/api/src/db/schema/`

### Step 3: Generate Migration
```bash
cd apps/api
bun drizzle-kit generate
```

### Step 4: Review Migration SQL
```bash
cat drizzle/migrations/[latest].sql
```

**STOP HERE** — Show me the SQL before running it.

### Step 5: Run Migration (after approval)
```bash
bun drizzle-kit migrate
```

## Breaking Change Checklist

| Change | Risk | Mitigation |
|--------|------|------------|
| Add required column | HIGH | Add with default, or make nullable first |
| Remove column | HIGH | Ensure no code references it |
| Rename column | HIGH | Add new, migrate data, remove old |
| Change type | MEDIUM | Check data compatibility |
| Add nullable column | LOW | Usually safe |
| Add index | LOW | Usually safe |
| Add table | LOW | Usually safe |

## Schema File Locations

```
apps/api/src/db/schema/
├── users.ts        # User accounts, auth
├── arcs.ts         # Story arcs and chapters
├── captures.ts     # User captures
├── passport.ts     # Stamps and progress
├── marketplace.ts  # Guides, bookings
├── gamification.ts # Coins, badges, XP
└── index.ts        # Exports all schemas
```

## Drizzle Schema Example

```typescript
// schema/arcs.ts
import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const arcs = pgTable('arcs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  worldType: text('world_type', { 
    enum: ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'] 
  }).notNull(),
  province: text('province').notNull(),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  authorId: text('author_id').references(() => users.id),
});
```

## Ask me:
1. What table are we changing? (or creating new?)
2. What columns are we adding/changing/removing?
3. Is there existing data that could be affected?
4. Do you have a backup or can we recreate the data?
