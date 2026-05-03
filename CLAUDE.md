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
Current Milestone: 49 — Next

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
- Last completed: M48 fully complete — email notifications on creator application approval/rejection + arc submission publish/reject via Resend (apps/admin/src/lib/email.ts, 4 HTML email templates, wired into all creator/submission server actions, graceful no-op if RESEND_API_KEY unset)
- Current blocker: None
- Next step: Milestone 49

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
- ✅ 36 — Dark mode: makeStyles(colors) factory pattern across all 20+ screens, light/dark/system ThemeMode store (zustand + AsyncStorage), useTheme hook, 3-way theme toggle on Profile screen (System/Light/Dark); world/brand colors hardcoded at module level, surface/text/border colors from useTheme()
- ✅ 37 — Badge system UI polish: badge detail modal (tap badge on profile grid), earned date display, progress bar toward unearned badges (e.g. "3/10 captures")
- ✅ 38 — Community feed: capture_likes table, discovery feed screen (world-type filter chips, masonry grid, photo modal), like/unlike with optimistic updates, CommunityStrip (horizontal) on chapter detail, CommunityGrid (3-col) on arc detail, Discover banner on Today tab
- ✅ 39 — Push notifications: Expo push token registration + PATCH /api/user/push-token, push_token on user table (migration 0007), sendPushNotification util, badge earn + arc completion pushes from capture.service.ts, deep link routing (badge→/profile, arc_complete→/arc/:id)
- ✅ 40 — Admin image upload: ImageUpload component (drag/drop + file picker), /api/upload route → Cloudflare R2 (S3-compatible), cover_image on chapters table (migration 0005), wired into ArcForm + ChapterForm; graceful 503 fallback if R2 not configured
- ✅ 41 — Partner listings foundation: partners + chapter_featured_partners + flash_deals + partner_reviews (migration 0008); API: /api/partners/nearby (PostGIS, category-aware radius, expand-if-empty), /chapter/:id, /province/:province, /:id, /flash-deals, POST /:id/reviews (verified visitor via capture history); admin: PartnerForm, partners list/new/edit pages, flash deal create/toggle, Nav updated with Partners link
- ✅ 42 — Partners in mobile: services/partners.ts, PartnerCard (photo/emoji fallback, category badge, featured badge, rating, distance, WhatsApp/Call button), partner detail screen (/partner/:id — photo carousel, contact buttons, hours, tags, reviews with verified badge, star review modal), chapter detail "Places nearby" section (featured first then proximity), arc detail "Plan your visit" horizontal scroll (FOOD/STAY/EXPERIENCE), registered in _layout.tsx
- ✅ 43 — QR coin redemption system: coin_offers + coin_redemptions tables (migration 0010), isLocal + coinBalance on partners (migration 0009); API /api/redeem (GET /:partnerId for offers, POST / to redeem); mobile redeem/scan.tsx (CameraView QR scanner parsing serendigo://redeem/{id}), redeem/[partnerId].tsx (offer selection, affordability gating, receipt screen with 6-char code); admin: QRCodeCard component (qrcode.react, download PNG + print), coin offers CRUD (createCoinOffer/deleteCoinOffer/toggleCoinOffer actions); family-run feature: isLocal sort priority in all partner queries (family-run first silently), 🏠 badge on PartnerCard + full-width warm card on partner detail; Today tab "Redeem your coins" banner → scan screen
- ✅ 44 — Admin panel polish: full-width layout (max-w-7xl on pages, removed sidebar max-w), PartnerForm 3-col grid (2/3 content + 1/3 sidebar, opening hours Mon-Sun fields, useTransition with success/error banners, MultiImageUpload), PartnersClient + ArcsClient + UsersClient (client-side filtering — search + category/status/province filters + result count), dashboard 6 stat cards + pending partners table + recent redemptions, Nav pending badge (red dot when unapproved partners > 0)
- ✅ 45 — Flash Deals mobile: WhileYoureHereSheet (animated slide-up Modal shown 800ms after capture success, showing nearby flash deals with countdown + partner emoji), Today tab amber gradient flash deal banner (→ flash-deals screen), push notifications on flash deal create (admin sendExpoPush), flash-deals.tsx full listing screen, useFlashDeals hook with Sri Lanka center fallback coords
- ✅ 46 — Creator Portal: creators + arc_submissions tables (DB migration 0012), apps/web creator landing page + application form (HMAC-signed cookie session, bcrypt, cuid2 slug), creator login + dashboard (server component), arc submission form with inline chapter JSONB editor + AI polish route (/api/polish → Claude claude-3-5-sonnet-latest), admin /creators (approve/reject/suspend applications, red nav badge), admin /submissions (approve-to-publish creates live arc + chapters rows, reject with feedback), mobile creator attribution card on arc detail screen, API arcs service attaches creator data to getArcById response
- ✅ 47 — Google Login + Real-time data: iOS PKCE OAuth via expo-auth-session (useAuthRequest + exchangeCodeAsync, code_verifier in extraParams), /api/google-signin endpoint (Google userinfo verify → find/create user → session token), auth middleware DB fallback for non-Better-Auth sessions, Google profile photo on Today tab avatar + profile hero with character badge overlay, ['arcs'] invalidation after capture/enrollment/quiz, pull-to-refresh on Arc Detail + Discover screens
- ✅ 48 — Creator portal polish + email notifications: /creators/profile page (circular avatar upload, bio/instagram/website fields, updateCreatorProfile server action); Google OAuth login for creator portal (server-side auth code flow, /api/auth/google + callback route handlers, state cookie CSRF, googleId column on creators table, Google photo backfilled on first login); Resend email notifications on creator approval/rejection + arc submission publish/reject (apps/admin/src/lib/email.ts, 4 HTML email templates)

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
- QR coin flow: static QR per partner (printed once) = `serendigo://redeem/{partnerId}`; scanner parses deep link → offer selection → confirmation code (6 uppercase chars); partner coinBalance incremented atomically via Drizzle sql template; user serendipityCoins deducted; redemption logged in coin_redemptions
- `isLocal` on partners = "family-run / independently owned small operation" (NOT about nationality); sorted first in all partner queries via `CASE WHEN isLocal THEN 0 ELSE 1 END`; shown as 🏠 "Family run" badge on cards
- TanStack Query: per-query `staleTime: 0, refetchOnMount: 'always'` needed for coin offers (global 5min staleTime caused stale empty results); applies to redeem/[partnerId].tsx query
- Admin client components (PartnersClient, ArcsClient, UsersClient): server fetches all → passes to client for in-memory filtering; pattern avoids server round-trips on filter change
- Creator Portal lives in apps/web (not a new app); auth is HMAC SHA-256 cookie (CREATOR_SESSION_SECRET env var, 30-day maxAge); separate from admin (ADMIN_SECRET) and traveller auth (Better Auth)
- Creators table lives in the shared Supabase DB; apps/web has its own Drizzle schema mirror (same pattern as apps/admin)
- Arc submission chapters stored as JSONB until published; on admin approve → rows inserted into arcs + chapters tables with arc.creatorId set
- AI polish endpoint POST /api/polish is an authenticated Next.js Route Handler; uses raw fetch to Anthropic API (no SDK dep); returns polished text only; requires ANTHROPIC_API_KEY in apps/web/.env.local
- Curated editorial model (not open UGC): apply → admin approves → creator can submit → admin publishes; quality floor is protected by two gates
- Google OAuth uses iOS Client ID (not Web) with reversed-domain redirect URI `com.googleusercontent.apps.CLIENT_ID:/oauth2redirect/google`; Web clients block custom URL schemes
- expo-auth-session/providers/google subpath import fails in Metro monorepo (ESM `export *`); use main package entry with inlined discovery document instead
- PKCE code_verifier must be in `extraParams: { code_verifier }` on `exchangeCodeAsync` — direct property is not serialized by `getQueryBody()`; capture codeVerifier via ref in `signInWithGoogle()` before re-renders
- `/api/google-signin` route name required — `/api/auth/*` is caught by Better Auth wildcard before reaching Hono routes
- `auth.api.getSession()` only validates Better Auth sessions; custom Google sessions need direct DB token lookup fallback in auth middleware
- Google profile photo stored in `user.image` (Better Auth standard field); profile screen shows photo with character emoji as badge overlay
- Creator portal Google OAuth uses server-side auth code flow (no PKCE needed — secret stays on server); state param stored in `google_oauth_state` httpOnly cookie (10min TTL) for CSRF; credentials in `apps/web/.env.local` (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_BASE_URL)
- Creator Google login matches by `googleId` first, then email fallback — so creators who applied with Gmail can sign in without re-linking; `googleId` column added to creators table (ALTER TABLE, unique)
- Creator photo upload at `/creators/profile` uses existing `/api/upload` route with `folder=creator-photos`; Google profile photo auto-backfilled into `creator.photo` on first Google login if not already set

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
