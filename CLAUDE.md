# SerendiGO — Claude Code Project Guide

## What This Is
A gamified travel app for Sri Lanka. The living guide to the island.
Full vision: see SERENDIGO_VISION.md

## Project Structure
```
serendigo/
├── apps/
│   ├── mobile/          # React Native + Expo Router
│   ├── api/             # Bun + Hono + Drizzle
│   └── admin/           # Next.js 15 + Payload CMS
├── packages/
│   └── shared/          # WorldType, Province, Arc, Chapter, Coordinates
└── docs/                # Documentation
```

## Current Phase
Phase 1 — Foundation
Current Milestone: 1 — Expo App Running

## Tech Stack

### Mobile (apps/mobile/)
- Expo SDK 52 (latest)
- Expo Router (file-based navigation)
- @shopify/react-native-skia (map + animations)
- react-native-reanimated 3 (gestures + transitions)
- react-native-mmkv (fast storage)
- @tanstack/react-query 5 (server state)
- zustand (client state)

### API (apps/api/)
- Bun runtime
- Hono framework
- Drizzle ORM
- PostgreSQL + PostGIS (Supabase)
- BullMQ (job queue)
- Better Auth

### Admin (apps/admin/)
- Next.js 15 App Router
- Payload CMS 3.x
- TailwindCSS + shadcn/ui

## Code Conventions

### File Naming
- Components: PascalCase (ArcCard.tsx)
- Utilities: camelCase (formatDate.ts)
- Constants: SCREAMING_SNAKE (API_URL)

### Mobile Structure
```
apps/mobile/src/
├── app/                 # Expo Router pages
├── components/          # Reusable components
├── hooks/               # Custom hooks
├── services/            # API calls
├── stores/              # Zustand stores
├── theme/               # Colors, fonts, spacing
└── utils/               # Helper functions
```

### API Structure
```
apps/api/src/
├── routes/              # Hono route definitions
├── handlers/            # Request handlers
├── services/            # Business logic
├── db/
│   ├── schema/          # Drizzle schemas
│   └── migrations/      # Generated migrations
├── jobs/                # BullMQ workers
└── utils/               # Helpers
```

### Rules
1. No `any` types — TypeScript strict mode
2. All colors from theme/colors.ts — never hardcode hex
3. All fonts from theme/typography.ts
4. API: route → handler → service (no logic in routes)
5. Mobile: TanStack Query for all API calls
6. Commit after each working feature
7. End of every session: update "Current Session Memory" — last completed, current blocker, next step
8. Shared types live in packages/shared — import from @serendigo/shared in both mobile and api

## Colors (Reference)
```typescript
const colors = {
  primary: '#E8832A',      // Temple Amber
  secondary: '#1A6B7A',    // Ocean Teal
  surface: '#F7F0E3',      // Coconut Cream
  surfaceWhite: '#FDFAF5', // Warm White
  textPrimary: '#1A1A2E',
  textSecondary: '#5A5A7A',
  
  // World colors
  taste: '#E67E22',
  wild: '#27AE60',
  move: '#2980B9',
  roots: '#8E44AD',
  restore: '#F39C12',
}
```

## Fonts
- Display/Titles: DM Serif Display
- Body/UI: Space Grotesk

## Current Session Memory
- Last completed: API scaffold — Hono server, Drizzle schema, all routes/handlers/services, BullMQ workers
- Current blocker: Need Supabase DATABASE_URL and Upstash REDIS_URL in apps/api/.env to run
- Next step: Fill apps/api/.env → run `cd apps/api && bun install && bun dev` → verify `curl http://localhost:3000/health`

## Environment Setup
Copy env files before first run:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin/.env.example apps/admin/.env
```
See each `.env.example` for required values (Supabase, Upstash, Stripe, Cloudflare R2).

## Important Decisions Made
<!-- Record architectural decisions here -->
1. Using Expo Router over React Navigation for file-based routing
2. Using Bun over Node.js for 3x faster TypeScript execution
3. Using Drizzle over Prisma for no code generation step
4. Using Supabase for managed PostgreSQL + PostGIS

## Commands Available
See .claude/commands/ for custom workflows:
- /new-screen — Create a new mobile screen
- /new-endpoint — Add an API endpoint
- /new-arc — Add story arc content
- /db-change — Database schema changes
- /debug — Systematic debugging workflow
- /test-milestone — Verify a milestone before moving on

## Skills Available
Specialized context auto-loaded when working in each area:
- serendigo-mobile — Mobile screens, animations, Expo, React Native
- serendigo-api — Backend endpoints, Drizzle schema, BullMQ jobs
- serendigo-content — Story arc and chapter content creation
