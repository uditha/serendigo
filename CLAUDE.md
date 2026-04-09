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
Current Milestone: 17 — Arc Database Schema

## Tech Stack

### Mobile (apps/mobile/)
- Expo SDK 54 (installed)
- Expo Router (file-based navigation) ✅
- react-native-svg (island map) ✅
- react-native-gesture-handler (pan/zoom) ✅
- react-native-reanimated 4 (gestures + transitions) ✅
- @tanstack/react-query 5 (server state) ✅
- react-native-mmkv (fast storage)
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
- Last completed: Milestone 16 — Character assignment saves to Supabase, auth store updated
- Current blocker: None
- Next step: Milestone 17 — Arc Database Schema

## Milestones Completed
- ✅ 1 — Expo app running
- ✅ 2 — Four tabs navigation (Today, The Island, Your Story, Passport)
- ✅ 3 — Fonts loading (DM Serif Display + Space Grotesk)
- ✅ 4 — Theme system (colors, typography, spacing)
- ✅ 5 — Sri Lanka SVG outline on island map (real GeoJSON, 25 districts)
- ✅ 6 — Individual district tap detection with toast
- ✅ 7 — Pan and zoom gestures (pinch 1x–8x, double-tap, clamp)
- ✅ 8 — District bottom sheet (slide up, drag to dismiss, amber highlight)
- ✅ 9 — Bun + Hono API running (GET /health)
- ✅ 10 — Mobile fetches API with TanStack Query (Today tab)
- ✅ 11 — Drizzle ORM + Supabase + 25 districts seeded
- ✅ 12 — Registration + Login screens (UI)
- ✅ 13 — Better Auth API endpoints working (sign-up/sign-in)
- ✅ 14 — Mobile auth flow: register → token stored → redirect to tabs
- ✅ 15 — Personality quiz UI (3 questions, 5 characters, calculating animation)
- ✅ 16 — Character assignment saved to Supabase user profile

## Key Decisions & Notes
- District name: "Mahanuvara" renamed to "Kandy" everywhere
- SVG rendered at native viewBox resolution, transform handles scale (keeps borders crisp)
- PostGIS geometry column removed from provinces — add back when location queries needed
- Supabase project: fnsqcimhicxzzjpgebba (eu-central-1)
- API runs on port 3000 — mobile .env points to LAN IP 192.168.86.22:3000
- Redis/BullMQ workers disabled until Upstash URL is configured
- MMKV replaced with AsyncStorage for Expo Go compatibility (swap back when doing EAS build)
- Better Auth user table is `user` (not `users`) — all FK references updated
- Auth token stored in AsyncStorage key `auth-storage` (Zustand persist format)

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
5. Districts (25) used instead of provinces (9) for map granularity
6. SVG map sourced from real MapSVG GeoJSON file — not hand-drawn

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
