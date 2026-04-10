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
│   └── admin/           # Next.js 15 App Router (custom, no CMS)
├── packages/
│   └── shared/          # WorldType, Province, Arc, Chapter, Coordinates
└── docs/                # Documentation
```

## Current Phase
Phase 1 — Foundation
Current Milestone: 35 — Next

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
- Next.js 15 App Router (custom — no CMS)
- Drizzle ORM (direct Supabase connection, same DB as API)
- TailwindCSS (utility classes only, no component library)
- Cookie-based auth via ADMIN_SECRET env var
- Server Actions for all mutations (no separate API layer)
- Runs on port 3001

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
- Last completed: Milestone 35 — Admin panel (custom Next.js 15, no CMS; arcs + chapters CRUD, users read-only, dashboard stats, cookie auth via ADMIN_SECRET, dark sidebar nav, server actions, Drizzle direct to Supabase, port 3001)
- Current blocker: None
- Next step: Milestone 36 — Badge system UI polish (badge detail modal, earned date, progress toward unearned badges)

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
- ✅ 17 — Arc database schema (arcs, chapters tables + Drizzle relations)
- ✅ 18 — Arc list + detail API endpoints (GET /api/arcs, GET /api/arcs/:id)
- ✅ 19 — Arc detail screen (mobile)
- ✅ 20 — Chapter detail screen (mobile)
- ✅ 21 — Camera capture screen (expo-camera, photo preview, viewfinder overlay)
- ✅ 22 — Submit capture screen (GPS lock, note, POST /api/capture, coins/XP/lore reveal)
- ✅ 23 — Passport tab (9 province stamp grid, arc progress bars, completed state, GET /api/passport)
- ✅ 24 — Today tab (greeting, coins badge, character banner, featured arc card, arc list)
- ✅ 25 — Your Story tab (XP bars, active arcs in-progress, captures feed, guest CTA, GET /api/story)
- ✅ 26 — Arc enrollment (Start Journey button, progress bar, chapter checkmarks, auto-enroll on capture)
- ✅ 27 — Polish: safe area all screens, headers hidden, island overlay (title + legend), story tab journey cards, captures screen, sign-out avatar button, pull-to-refresh Today, XP write bug fixed, dev photo storage, post-capture cache invalidation
- ✅ 28 — Onboarding flow: Welcome → Visitor/Local choice → 3 feature slides (Arcs, Capture, Passport) → quiz; isLocal in authStore; Today tab greeting personalized
- ✅ 29 — Island map arc discovery: tap district → bottom sheet shows real arcs for that province; arc cards navigate to arc detail; safe area on all screens (login, register, quiz, capture, submit)
- ✅ 30 — Profile screen (/profile): character hero card, stats row (coins/captures/journeys/completed), XP bars, retake quiz + sign out actions; avatar button on Today tab navigates to profile; story API extended with stats (totalCaptures, arcsEnrolled, arcsCompleted)
- ✅ 31 — Arc browse screen (/arc): world type filter chips (ALL/TASTE/WILD/MOVE/ROOTS/RESTORE), arc cards with colored banners, fixed broken "See all →" link on Today tab; 9 sample arcs seeded across 7 provinces (Western, North Central, Southern, Sabaragamuwa, Uva, Central, Northern) covering all 5 world types
- ✅ 32 — Island map SVG pins: teardrop shape per arc (glow + body + circle + emoji); enrollment enforcement (API checks userArcs before capture, chapter detail shows "Start Journey First" CTA if not enrolled)
- ✅ 33 — Badge system: badges + user_badges tables, 10 badge definitions (capture milestones, arc completion, world diversity, province explorer), inline award logic after every capture, celebration overlay on submit screen, badge grid on profile screen
- ✅ 34 — Leaderboard: GET /api/leaderboard (top 20 by coins), podium for top 3, ranked list with current user highlighted, entry point in Your Story tab
- ✅ 35 — Admin panel: custom Next.js 15 App Router (no CMS), arcs + chapters CRUD with forms, users list, dashboard stats, cookie auth (ADMIN_SECRET), dark sidebar, server actions, direct Drizzle → Supabase, port 3001

## Key Decisions & Notes
- District name: "Mahanuvara" renamed to "Kandy" everywhere
- SVG rendered at native viewBox resolution, transform handles scale (keeps borders crisp)
- PostGIS geometry column removed from provinces — add back when location queries needed
- No separate `provinces` table — passport service derives 9 provinces via `SELECT DISTINCT province FROM districts`
- Supabase project: fnsqcimhicxzzjpgebba (eu-central-1)
- API runs on port 3000 — mobile .env points to LAN IP 192.168.86.22:3000
- Redis/BullMQ workers disabled until Upstash URL is configured
- MMKV replaced with AsyncStorage for Expo Go compatibility (swap back when doing EAS build)
- Better Auth user table is `user` (not `users`) — all FK references updated
- Auth token stored in AsyncStorage key `auth-storage` (Zustand persist format)
- `expo-haptics` installed (v15.0.8) — used in capture submit screen
- BullMQ queues are nullable — always use `?.add()` since Redis may not be configured
- `SKIP_LOCATION_CHECK=true` in api/.env bypasses PostGIS radius check for local dev — must be unset/false in production
- In dev (no R2 credentials), photos saved to `apps/api/uploads/` and served via `GET /uploads/*` — set `API_BASE_URL` in api/.env to LAN IP so mobile can load them
- XP update bug: Drizzle `.set()` requires camelCase keys (tasteXP not taste_xp) — fixed in capture.service.ts
- All screens use `useSafeAreaInsets` for dynamic top padding — never hardcode paddingTop
- All Stack screens registered in `app/_layout.tsx` with `headerShown: false`
- Sign-out via avatar initial button (top-right Today tab) → native Alert → `clearAuth()`
- Story tab "My Journeys": completed arcs → captures screen, in-progress → arc detail
- `GET /api/arcs/:id/my-captures` returns per-chapter capture data for the captures screen
- After capture: invalidates story, arc-progress, passport queries + calls refreshUser() to update coins in store
- Island map district→province lookup: `DISTRICT_TO_PROVINCE` built from `sriLankaProvinces.ts`; arc.province is uppercase in DB (e.g. 'WESTERN') — compare with `.toLowerCase()` against PROVINCES id (e.g. 'western')
- Onboarding: new users → /onboarding/welcome after register; existing users → /(tabs) after login (no onboarding for returning users)
- `isLocal: boolean | null` stored in authStore (persisted) — null means user skipped the choice
- Arc browse screen name in _layout.tsx must be `"arc/index"` (not `"arc"`) — Expo Router uses the full path for index files inside subdirectories
- arc.province in DB is uppercase with underscores (e.g. 'WESTERN', 'NORTH_CENTRAL'); PROVINCES ids in mobile are lowercase (e.g. 'western') — always compare with `.toLowerCase()`
- Sample arcs: 9 total, seeded via `bun run src/db/seed-arcs.ts` from apps/api — idempotent (onConflictDoUpdate)
- Capture requires enrollment: capture.service.ts checks userArcs record exists before allowing capture — removed auto-enroll; chapter detail screen shows "Start Journey First" CTA if not enrolled
- Island map arc pins are teardrop SVG shapes: glow circle (r+7, 22% opacity) + teardrop Path + white-bordered circle + world type emoji via SvgText; world type → emoji mapping: TASTE=🍜, WILD=🌿, MOVE=⚡, ROOTS=🏛️, RESTORE=🧘; pin tip points down at chapter GPS coords via tangent math (sin30°=0.5, cos30°=0.866)
- Today tab "Continue your journey" capped at 3 most recent, "See all (N) →" links to Your Story tab
- Your Story "My Journeys" split into IN PROGRESS and COMPLETED subsections
- Leaderboard is public (no auth required); entry point in Your Story tab shows top-3 name preview
- Badge check runs inline in processCapture (not via queue) so badgesEarned is returned synchronously in capture response
- reset-user-data.ts script resets game data only (captures, enrollments, badges, coins, XP) without deleting the account
- Profile avatar button: 44×44pt (Apple minimum tap target)
- Admin panel: custom Next.js 15 (rejected Payload CMS — too heavy for internal content tool); runs on port 3001; auth is a single ADMIN_SECRET cookie (no user table needed); schema defined in apps/admin/src/db/schema.ts (mirrors API schema, not imported from it — keeps admin self-contained); server actions handle all mutations (no separate API layer)
- Admin DATABASE_URL (not DATABASE_URI) connects directly to Supabase — same instance as API

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
