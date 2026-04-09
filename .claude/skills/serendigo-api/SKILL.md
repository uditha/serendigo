---
name: serendigo-api
description: Build the SerendiGO backend API. Use this skill whenever working on API endpoints, database schemas, authentication, background jobs, or any server-side code. Triggers for Bun, Hono, Drizzle ORM, PostgreSQL, PostGIS, BullMQ, or backend architecture discussions. Also use when creating endpoints, services, handlers, or database migrations.
---

# SerendiGO API Development Skill

## Project Context

SerendiGO API is a Bun + Hono backend serving the mobile app. It handles user authentication, story arcs, capture moments, gamification, and marketplace features.

## Tech Stack

```
Runtime:       Bun 1.3+
Framework:     Hono
ORM:           Drizzle ORM
Database:      PostgreSQL 16 + PostGIS (Supabase)
Cache:         Redis (Upstash)
Job Queue:     BullMQ
Auth:          Better Auth
Payments:      Stripe + PayHere
Images:        Cloudflare R2 + Cloudflare Images
AI:            OpenAI GPT-4o
Email:         Resend
```

## File Structure

```
apps/api/
├── src/
│   ├── index.ts           # Main entry, Hono app
│   ├── routes/            # Route definitions
│   │   ├── auth.ts
│   │   ├── arcs.ts
│   │   ├── capture.ts
│   │   ├── passport.ts
│   │   └── marketplace.ts
│   ├── handlers/          # Request handlers
│   │   └── [domain].handler.ts
│   ├── services/          # Business logic
│   │   └── [domain].service.ts
│   ├── db/
│   │   ├── index.ts       # Database connection
│   │   ├── schema/        # Drizzle schemas
│   │   │   ├── users.ts
│   │   │   ├── arcs.ts
│   │   │   ├── captures.ts
│   │   │   └── index.ts
│   │   └── migrations/    # Generated migrations
│   ├── jobs/              # BullMQ workers
│   │   ├── badge.worker.ts
│   │   ├── notification.worker.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error.ts
│   └── utils/
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## Architecture Pattern

```
Request → Route → Handler → Service → Database
                     ↓
              Background Job (BullMQ)
```

**Rules:**
- **Routes**: Only define paths and middleware
- **Handlers**: Validate input, call service, return response
- **Services**: ALL business logic lives here
- **Jobs**: Async processing (badges, notifications, analytics)

## Database Schema

### Core Tables

```typescript
// schema/users.ts
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'),
  profileImage: text('profile_image'),
  travellerCharacter: text('traveller_character'),
  
  // XP categories
  cultureXP: integer('culture_xp').default(0),
  actionXP: integer('action_xp').default(0),
  wellnessXP: integer('wellness_xp').default(0),
  adventureXP: integer('adventure_xp').default(0),
  tasteXP: integer('taste_xp').default(0),
  
  // Gamification
  serendipityCoins: integer('serendipity_coins').default(0),
  level: integer('level').default(1),
  
  // OAuth
  googleId: text('google_id'),
  appleId: text('apple_id'),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// schema/arcs.ts
export const arcs = pgTable('arcs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  worldType: text('world_type', { 
    enum: ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'] 
  }).notNull(),
  province: text('province').notNull(),
  narratorName: text('narrator_name'),
  introText: text('intro_text'),
  coverImage: text('cover_image'),
  seasonStart: integer('season_start'), // 1-12
  seasonEnd: integer('season_end'),     // 1-12
  isSeasonal: boolean('is_seasonal').default(false),
  isPublished: boolean('is_published').default(false),
  authorUserId: text('author_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// schema/chapters.ts
export const chapters = pgTable('chapters', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  arcId: text('arc_id').references(() => arcs.id).notNull(),
  order: integer('order').notNull(),
  title: text('title').notNull(),
  loreText: text('lore_text'), // Revealed after capture
  beforeYouGo: jsonb('before_you_go'), // { dressCode, bestTime, entryFee, etiquette }
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  radiusMeters: integer('radius_meters').default(200),
  coinReward: integer('coin_reward').default(50),
  xpCategory: text('xp_category'),
  createdAt: timestamp('created_at').defaultNow(),
});

// schema/captures.ts
export const captures = pgTable('captures', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id).notNull(),
  chapterId: text('chapter_id').references(() => chapters.id).notNull(),
  photoUrl: text('photo_url').notNull(),
  note: text('note'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  coinsEarned: integer('coins_earned').notNull(),
  isPublic: boolean('is_public').default(false),
  capturedAt: timestamp('captured_at').defaultNow(),
});

// schema/provinces.ts (with PostGIS)
export const provinces = pgTable('provinces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  polygon: geometry('polygon', { type: 'Polygon', srid: 4326 }),
  stampDesignKey: text('stamp_design_key'),
  fillColor: text('fill_color'),
});
```

## Endpoint Patterns

### Route Definition

```typescript
// routes/arcs.ts
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import * as handlers from '../handlers/arcs.handler';

const arcs = new Hono();

arcs.get('/', handlers.getArcs);
arcs.get('/:id', handlers.getArcById);
arcs.post('/:id/enroll', authMiddleware, handlers.enrollInArc);
arcs.get('/:id/chapters', handlers.getChapters);

export default arcs;
```

### Handler Pattern

```typescript
// handlers/arcs.handler.ts
import { Context } from 'hono';
import * as arcService from '../services/arcs.service';

export async function getArcs(c: Context) {
  try {
    const { province, worldType } = c.req.query();
    const arcs = await arcService.getArcs({ province, worldType });
    return c.json({ success: true, data: arcs });
  } catch (error) {
    console.error('getArcs error:', error);
    return c.json({ success: false, error: 'Failed to fetch arcs' }, 500);
  }
}

export async function enrollInArc(c: Context) {
  try {
    const userId = c.get('userId'); // From auth middleware
    const arcId = c.req.param('id');
    const enrollment = await arcService.enrollUser(userId, arcId);
    return c.json({ success: true, data: enrollment });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
}
```

### Service Pattern

```typescript
// services/arcs.service.ts
import { db } from '../db';
import { arcs, chapters, userArcs } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface ArcFilters {
  province?: string;
  worldType?: string;
}

export async function getArcs(filters: ArcFilters) {
  const conditions = [eq(arcs.isPublished, true)];
  
  if (filters.province) {
    conditions.push(eq(arcs.province, filters.province));
  }
  if (filters.worldType) {
    conditions.push(eq(arcs.worldType, filters.worldType));
  }
  
  const result = await db
    .select()
    .from(arcs)
    .where(and(...conditions))
    .orderBy(arcs.title);
    
  // Add season info
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  return result.map(arc => ({
    ...arc,
    isActiveNow: isInSeason(arc, currentMonth),
  }));
}

function isInSeason(arc: typeof arcs.$inferSelect, month: number): boolean {
  if (!arc.isSeasonal) return true;
  if (arc.seasonStart <= arc.seasonEnd) {
    return month >= arc.seasonStart && month <= arc.seasonEnd;
  }
  // Wraps around year (e.g., Nov-Apr)
  return month >= arc.seasonStart || month <= arc.seasonEnd;
}
```

## Critical Endpoint: POST /api/capture

This is the most important endpoint — the core of the app.

```typescript
// handlers/capture.handler.ts
export async function createCapture(c: Context) {
  const userId = c.get('userId');
  const formData = await c.req.formData();
  
  const chapterId = formData.get('chapterId') as string;
  const photo = formData.get('photo') as File;
  const lat = parseFloat(formData.get('lat') as string);
  const lng = parseFloat(formData.get('lng') as string);
  const note = formData.get('note') as string | null;
  
  // Service handles everything
  const result = await captureService.processCapture({
    userId,
    chapterId,
    photo,
    lat,
    lng,
    note,
  });
  
  return c.json({
    success: true,
    coinsEarned: result.coinsEarned,
    xpEarned: result.xpEarned,
    badgeEarned: result.badgeEarned,
    arcComplete: result.arcComplete,
    provinceComplete: result.provinceComplete,
  });
}
```

```typescript
// services/capture.service.ts
export async function processCapture(input: CaptureInput) {
  // 1. Verify GPS within chapter radius (PostGIS)
  const chapter = await db.query.chapters.findFirst({
    where: eq(chapters.id, input.chapterId),
  });
  
  const withinRadius = await verifyLocation(
    input.lat, 
    input.lng, 
    chapter.lat, 
    chapter.lng, 
    chapter.radiusMeters
  );
  
  if (!withinRadius) {
    throw new Error('You are not close enough to this location');
  }
  
  // 2. Upload photo to Cloudflare R2
  const photoUrl = await uploadPhoto(input.photo, input.userId);
  
  // 3. Create capture record
  const [capture] = await db.insert(captures).values({
    userId: input.userId,
    chapterId: input.chapterId,
    photoUrl,
    note: input.note,
    lat: input.lat,
    lng: input.lng,
    coinsEarned: chapter.coinReward,
  }).returning();
  
  // 4. Award coins
  await db.update(users)
    .set({ 
      serendipityCoins: sql`serendipity_coins + ${chapter.coinReward}` 
    })
    .where(eq(users.id, input.userId));
  
  // 5. Queue background jobs
  await badgeQueue.add('check-badges', { userId: input.userId });
  await journalQueue.add('create-entry', { captureId: capture.id });
  await leaderboardQueue.add('update', { userId: input.userId, coins: chapter.coinReward });
  
  // 6. Check arc/province completion
  const arcComplete = await checkArcCompletion(input.userId, chapter.arcId);
  const provinceComplete = await checkProvinceCompletion(input.userId, chapter);
  
  return {
    coinsEarned: chapter.coinReward,
    xpEarned: { [chapter.xpCategory]: chapter.coinReward },
    badgeEarned: null, // Handled by background job
    arcComplete,
    provinceComplete,
  };
}

async function verifyLocation(
  userLat: number, 
  userLng: number, 
  chapterLat: number, 
  chapterLng: number, 
  radiusMeters: number
): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT ST_DWithin(
      ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
      ST_SetSRID(ST_MakePoint(${chapterLng}, ${chapterLat}), 4326)::geography,
      ${radiusMeters}
    ) as within
  `);
  return result.rows[0]?.within === true;
}
```

## Background Jobs (BullMQ)

```typescript
// jobs/badge.worker.ts
import { Worker } from 'bullmq';
import { redis } from '../utils/redis';
import * as badgeService from '../services/badge.service';

const worker = new Worker('badges', async (job) => {
  const { userId } = job.data;
  
  // Check all badge conditions
  const newBadges = await badgeService.checkBadgeConditions(userId);
  
  if (newBadges.length > 0) {
    // Queue push notification
    await notificationQueue.add('badge-earned', {
      userId,
      badges: newBadges,
    });
  }
}, { connection: redis });
```

## Response Format

```typescript
// Success
{ 
  success: true, 
  data: { ... } 
}

// Error
{ 
  success: false, 
  error: "Error message" 
}

// Paginated
{ 
  success: true, 
  data: [...],
  pagination: { 
    page: 1, 
    limit: 20, 
    total: 150 
  }
}
```

## PostGIS Patterns

### Province Detection
```typescript
async function getProvinceForLocation(lat: number, lng: number) {
  const result = await db.execute(sql`
    SELECT id, name, slug FROM provinces
    WHERE ST_Contains(
      polygon,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
    )
  `);
  return result.rows[0];
}
```

### Nearby Chapters
```typescript
async function getNearbyChapters(lat: number, lng: number, radiusKm: number) {
  const result = await db.execute(sql`
    SELECT c.*, 
      ST_Distance(
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(c.lng, c.lat), 4326)::geography
      ) as distance_meters
    FROM chapters c
    WHERE ST_DWithin(
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      ST_SetSRID(ST_MakePoint(c.lng, c.lat), 4326)::geography,
      ${radiusKm * 1000}
    )
    ORDER BY distance_meters
    LIMIT 10
  `);
  return result.rows;
}
```

## Critical Rules

1. **No logic in routes or handlers** — All business logic in services
2. **No raw SQL in handlers** — Use Drizzle ORM or service methods
3. **Always validate input** — Before passing to services
4. **Use BullMQ for async work** — Badges, notifications, analytics
5. **Return consistent response format** — { success, data/error }
6. **Use PostGIS for location queries** — Not JS distance calculations
7. **Environment variables for secrets** — Never hardcode credentials

## Common Tasks

### Adding a new endpoint
1. Add route in `routes/[domain].ts`
2. Create handler in `handlers/[domain].handler.ts`
3. Create service in `services/[domain].service.ts`
4. Add schema if new table needed
5. Register route in `src/index.ts`

### Adding a database table
1. Create schema in `db/schema/[name].ts`
2. Export from `db/schema/index.ts`
3. Run `bun drizzle-kit generate`
4. Review migration SQL
5. Run `bun drizzle-kit migrate`

### Adding a background job
1. Create worker in `jobs/[name].worker.ts`
2. Add queue to `jobs/index.ts`
3. Add job from service using `queue.add()`
