# SerendiGO — Claude Code Development Guide
### How to build this app session by session

*Your complete workflow for using Claude Code across the entire development journey*

---

## How to Read This Guide

This is not a generic "how to use AI" document. It tells you exactly:
- What to do before each Claude Code session
- What to say (exact prompts you can copy)
- What to watch for mid-session
- What to do when things go wrong
- How to move from Phase 1 to Phase 3 without losing your mind

Every session in this guide has a **Goal**, **Prepare**, **Say This**, and **End With** section.

---

# PART 1 — Setting Up Claude Code for SerendiGO

---

## 1.1 The New Repository Setup

Since you're building fresh, do this first. These two steps are what makes Claude Code understand your project from the very first message.

**Step 1: Create the new repo and initialise Claude Code context**

```bash
mkdir serendigo
cd serendigo
git init
git commit --allow-empty -m "Initial commit"
```

**Step 2: Create `CLAUDE.md` immediately** — before writing any code.

CLAUDE.md is the single most important file for Claude Code. It is loaded at the start of every single session. If it's good, every session starts with Claude already knowing your project. If it's missing or vague, you waste the first 10 minutes of every session re-explaining things.

Start with this structure and update it as you build:

```markdown
# SerendiGO — Claude Code Guide

## What We're Building
Gamified travel app for Sri Lanka. Fresh build (not modifying old codebase).
Full vision: see SERENDIGO_VISION.md

## Three Packages
- serendigo-mobile/   → React Native + Expo Router (the app)
- serendigo-api/      → Bun + Hono + Drizzle (backend)
- serendigo-admin/    → Next.js 15 + Payload CMS (web admin)

## Current Phase
Phase 1 — [update this as you progress]
Current focus: [what you're building right now]

## Tech Stack (brief)
Mobile:  Expo Router, Skia, MMKV, WatermelonDB, TanStack Query, Zustand
API:     Bun, Hono, Drizzle ORM, PostgreSQL + PostGIS, Upstash Redis, BullMQ
Admin:   Next.js 15, Payload CMS, TailwindCSS
Auth:    Better Auth (Google + Apple Sign-In)
Images:  Cloudflare R2 + Cloudflare Images
DB:      Supabase (PostgreSQL + PostGIS managed)

## Conventions
- API: Hono route → handler function → service function (no logic in routes)
- Mobile: screens/FeatureName/index.tsx + styles.ts
- All error handling at service layer, handlers just catch and respond
- Never console.log — use Bun's built-in console in dev, structured logs in prod
- TypeScript strict throughout — no `any`
- Drizzle schema in api/src/db/schema/ one file per domain
- Colours, fonts, spacing all from mobile/src/theme/index.ts — never hardcoded
- Skia and Reanimated worklets for all animations (not setState)

## Key Files
- SERENDIGO_VISION.md → full product vision, read this if unsure about a decision
- CLAUDE_CODE_DEV_GUIDE.md → this file (development sessions plan)
```

**Step 3: Set up project-level memory**
Claude Code saves memory per project directory. Every insight, decision, and preference you establish gets remembered.

At the start of the project, tell Claude Code:

> "Remember this about our project: we are building SerendiGO from scratch. The full product vision is in SERENDIGO_VISION.md. We use Bun + Hono on the backend, Expo Router on mobile. The core philosophy is: one-tap Capture Moment, illustrated SVG map of Sri Lanka, five Experience Worlds (Taste/Wild/Move/Roots/Restore). Always check SERENDIGO_VISION.md before making product decisions."

---

## 1.2 Project Commands (Custom Skills)

Create these in `.claude/commands/` in the new repo. They save you from typing the same context every time.

**`.claude/commands/new-screen.md`**
```markdown
# new-screen
Create a new mobile screen for SerendiGO.

1. Read the relevant existing screen for pattern reference
2. Create mobile/src/screens/[Name]/index.tsx + styles.ts
3. Theme values from mobile/src/theme/index.ts — never hardcode colours
4. TanStack Query for all API calls
5. Zustand for local UI state
6. Expo Router Link/router.push for navigation
7. DM Serif Display for display text, Space Grotesk for body
8. Skia + Reanimated for any animations — no Animated API
9. Register route in the Expo Router file structure
```

**`.claude/commands/new-endpoint.md`**
```markdown
# new-endpoint
Add a new API endpoint to the Hono backend.

1. Route file in api/src/routes/[domain].ts
2. Handler function (HTTP only — validate, call service, respond)
3. Service function in api/src/services/[domain].service.ts (all logic here)
4. Drizzle query in service — no raw SQL
5. BullMQ job if anything should process async
6. Response format: { success: true, data: ... } or { error: "message" }
7. Register route in api/src/index.ts
```

**`.claude/commands/new-arc.md`**
```markdown
# new-arc
Add a new story arc with chapters to the database seed/admin.

Arc needs: title, slug, world_type (TASTE/WILD/MOVE/ROOTS/RESTORE),
province, season_start/end (if seasonal), narrator text, intro, chapters.

Each chapter needs: title, lore_text (revealed after capture),
before_you_go JSON (dress_code, best_time, entry_fee, etiquette),
lat/lng, radius_meters, coin_reward, xp_category.

Output as Drizzle seed insert statements.
```

**`.claude/commands/db-change.md`**
```markdown
# db-change
Make a Drizzle schema change and generate migration.

1. Read current schema in api/src/db/schema/
2. Make the change
3. Run: bun drizzle-kit generate
4. Review the generated SQL
5. Run: bun drizzle-kit migrate
6. Warn about breaking changes (required fields, renames, drops)
```

---

## 1.3 The Session Rhythm

Every Claude Code session follows this pattern:

```
BEFORE SESSION (5 min):
  → Know exactly what you want to finish
  → Have the relevant SERENDIGO_VISION.md section open
  → Have the previous session's git log visible

START SESSION:
  → Claude reads CLAUDE.md automatically
  → Update "Current focus" in CLAUDE.md if phase changed
  → State your session goal in the first message

DURING SESSION:
  → Commit every completed feature (Claude can do this)
  → If something looks wrong, say so immediately
  → Ask for explanation if you don't understand a decision

END SESSION:
  → Ask Claude to update CLAUDE.md with anything new
  → Commit everything
  → Write one line in your own notes: what you built + what's next
```

---

# PART 2 — Phase 1 Sessions

*Goal: A traveller can land in Sri Lanka, find an arc on the illustrated map, capture a moment, and book a local guide — within 30 minutes of arrival.*

*Estimated: 12–15 focused sessions across 3 months*

---

## SESSION 1 — Project Scaffolding
**Duration:** 3–4 hours | **Type:** Setup

**Goal:** Three working repos, running locally, connected to each other.

**Say this to Claude Code:**
> "Set up the SerendiGO monorepo from scratch. Three packages:
> 1. `serendigo-api/` — Bun runtime + Hono framework + Drizzle ORM + TypeScript strict mode. Connect to Supabase PostgreSQL using the DATABASE_URL I'll provide. Basic health check endpoint at GET /health.
> 2. `serendigo-mobile/` — Expo SDK 54 + Expo Router (file-based routing). Install: @shopify/react-native-skia, react-native-reanimated 4, react-native-gesture-handler, react-native-mmkv, react-native-svg, expo-camera, expo-location, expo-haptics, expo-notifications, @tanstack/react-query, zustand, date-fns, @expo-google-fonts/dm-serif-display, @expo-google-fonts/space-grotesk.
> 3. `serendigo-admin/` — Next.js 15 App Router + Payload CMS 3.x + TailwindCSS + shadcn/ui.
>
> Mobile theme file at mobile/src/theme/index.ts with all colours from SERENDIGO_VISION.md colour system. A working tab layout with four tabs: Today, The Island, Your Story, Passport. Placeholder screens for each."

**Watch for:** Expo Router setup is finicky. Make sure the `app/` directory structure is correct and the tab layout renders before moving on.

**End with:**
```
bun dev          # API starts on :3000
cd serendigo-mobile && npx expo start    # Mobile QR code
cd serendigo-admin && bun dev            # Admin on :3001
```

**Commit message:** `feat: project scaffolding — three packages running`

---

## SESSION 2 — Database Schema & Supabase
**Duration:** 2–3 hours | **Type:** Data Architecture

**Goal:** Full Drizzle schema matching the vision. Supabase connected. PostGIS working.

**Before this session:** Have your Supabase project URL and anon key ready.

**Say this to Claude Code:**
> "Create the complete Drizzle ORM schema for SerendiGO in `api/src/db/schema/`. Split into domain files: users.ts, arcs.ts, captures.ts, passport.ts, marketplace.ts, community.ts, gamification.ts.
>
> Required models (full details in SERENDIGO_VISION.md Part 6.6):
> - Users: id, name, email, password, role, googleId, appleId, profileImage, bio, travellerCharacter, cultureXP, actionXP, wellnessXP, adventureXP, tasteXP, serendipityCoins, level, levelTitle, completedProvinces
> - Provinces: id, name, slug, polygonGeoJson (PostGIS), stampDesignKey, fillColour
> - Arcs: id, title, slug, worldType (TASTE/WILD/MOVE/ROOTS/RESTORE), province, seasonStart, seasonEnd, isSeasonal, narratorName, introText, hiddenGemJson, difficulty, coverImage, arcType, authorUserId, isPublished
> - Chapters: id, arcId, order, title, loreText, beforeYouGoJson, lat, lng, radiusMeters, coinReward, xpCategory, worldType, photoRequired
> - Captures: id, userId, chapterId, photoUrl, note, lat, lng, coinsEarned, isPublic, capturedAt
> - PassportStamps: id, userId, chapterId, provinceId, stampDesignKey, capturedAt
> - UserArcs: id, userId, arcId, startedAt, completedAt, currentChapter
> - Badges, UserBadges, FlashDeals, Partners, FundProjects, FundVotes, PriceGuides
>
> Enable PostGIS on Supabase. Add spatial index on Province polygonGeoJson. Generate migration and run it."

**Watch for:** PostGIS might need enabling manually in Supabase dashboard (Extensions → Enable PostGIS). Do this before running the migration.

**Commit message:** `feat: complete drizzle schema + supabase connection`

---

## SESSION 3 — Authentication
**Duration:** 2–3 hours | **Type:** Feature

**Goal:** Working auth. Email/password + Google + Apple Sign-In. JWT sessions. Mobile and API connected.

**Say this to Claude Code:**
> "Implement authentication using Better Auth library. Backend in `api/src/auth/`. Mobile in `mobile/src/services/auth.ts` and `mobile/src/store/auth.store.ts` (Zustand).
>
> Required:
> - Email/password sign up + sign in
> - Google OAuth (use expo-auth-session on mobile)
> - Apple Sign-In (required for App Store)
> - JWT sessions stored in MMKV on mobile (not AsyncStorage)
> - Auth middleware for Hono: `authMiddleware` that verifies JWT and attaches user to context
> - Auto-refresh token before expiry
> - Onboarding flag: `hasCompletedOnboarding` on user — redirect new users to onboarding flow
>
> Mobile: LoginScreen at app/(auth)/login.tsx, RegisterScreen at app/(auth)/register.tsx. After login, push to app/(tabs)/. After register, push to app/onboarding/."

**Watch for:** Apple Sign-In requires a paid Apple Developer account and specific entitlement configuration in `app.json`. If not ready, implement the UI and add a `// TODO: Add Apple credentials` flag.

**Commit message:** `feat: authentication — email + google + apple sign-in`

---

## SESSION 4 — Onboarding Flow
**Duration:** 2 hours | **Type:** Feature (UX-critical)

**Goal:** The 3-screen personality quiz that assigns a Traveller Character.

**Say this to Claude Code:**
> "Build the onboarding flow at `mobile/src/app/onboarding/`. Three screens connected as a step flow.
>
> Screen 1 (index.tsx): 'Picture your perfect evening in Sri Lanka' — 4 options as large illustrated choice cards (A: hilltop sunset with tea, B: temple courtyard with monks chanting, C: beachside seafood dinner, D: jungle lodge with stars). DM Serif Display for the question. Tap to select, spring animation on selection.
>
> Screen 2: 'You have one free afternoon. No plan. You...' — 4 options (A: bicycle until something interests you, B: ask a local what they'd show a friend, C: find the most beautiful spot and sit, D: try to fit in three more things from a list).
>
> Screen 3: A duration slider — 3 days / 7 days / 14 days / 21+ days. Simple, visual.
>
> After step 3: derive Traveller Character from answers (The Wanderer / Storyteller / Seeker / Adventurer / Gourmand) and PATCH to API endpoint PATCH /api/users/me/onboarding. Show character reveal screen with character name in DM Serif Display, a one-paragraph description, and 'Start Exploring' CTA. Save character to Zustand auth store and MMKV.
>
> Skip button on each screen (saves 'skipped' as character)."

**Commit message:** `feat: onboarding — traveller character quiz`

---

## SESSION 5 — The Island Map (Part 1: Province Layer)
**Duration:** 4–5 hours | **Type:** Core Feature (most complex in Phase 1)

**Goal:** Sri Lanka rendered as a beautiful SVG map with explorable provinces.

**Say this to Claude Code:**
> "Build The Island screen at `mobile/src/app/(tabs)/island.tsx`. This is the main discovery interface — an illustrated SVG map of Sri Lanka.
>
> Use react-native-svg for the province polygon base layer. I need SVG path data for all 9 Sri Lanka provinces (Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa). Source simplified GeoJSON and convert to SVG paths.
>
> Layers (bottom to top):
> 1. Background: Coconut Cream (#F7F0E3) fill
> 2. Province polygons (react-native-svg): explored provinces fill with amber (#E8832A at 30% opacity), unexplored fill with cool grey (#9A9AB0 at 20% opacity), province borders in amber (#E8832A at 60% opacity, strokeWidth 1.5)
> 3. Skia canvas overlay: for province glow animations when user enters new province
> 4. Chapter location pins: positioned absolutely using lat/lng converted to SVG coordinates — small illustrated icons (use emoji or simple SVG shapes as placeholder, we'll replace with custom icons later)
>
> Pan and pinch-to-zoom using react-native-gesture-handler + react-native-reanimated 4 worklets. Min scale 1.0 (full island), max scale 4.0.
>
> Province tap: tap a province polygon → bottom sheet slides up showing province name + arc count + 'Explore' button."

**Watch for:** SVG coordinate conversion from lat/lng to screen space is the hard part. Make sure the bounding box (roughly lat 5.9–9.9, lng 79.6–81.9) maps correctly to your SVG viewport.

**Commit after Part 1:** `feat: island map — province SVG layer with pan/zoom`

---

## SESSION 6 — The Island Map (Part 2: Arc Pins & Discovery)
**Duration:** 3 hours | **Type:** Core Feature (continuation)

**Say this to Claude Code:**
> "Continue the Island map. Add arc discovery layer.
>
> 1. API endpoint: GET /api/arcs with query params: province?, worldType?, isEnrolled? Returns arc list with lat/lng of first chapter, worldType, title, chapterCount, coinTotal, seasonStart, seasonEnd, isActive (based on today's date vs season).
>
> 2. On mobile: fetch arcs with TanStack Query. Render each arc as a positioned icon on the map. Icon shape based on worldType: 🍴 Taste, 🐾 Wild, 🌊 Move, 🏛 Roots, 🌿 Restore (emoji placeholder, replace with Skia-drawn icons in Session 8). Active season arcs: full opacity. Out-of-season: 50% opacity with a small clock badge.
>
> 3. Tap an arc pin → bottom sheet slides up (react-native-reanimated bottom sheet, not a library). Sheet shows: arc cover image, title in DM Serif Display, worldType chip, chapter count, distance from user, season info, 'Begin This Arc' button. Tap button → navigate to app/arc/[id].tsx.
>
> 4. Filter bar at top of map: chips for each worldType. Tapping a chip filters visible pins. 'All' chip resets.
>
> 5. User's current province: detect from GPS on mount. Highlight that province on the SVG with a slightly stronger fill."

**Commit message:** `feat: island map — arc pins, discovery bottom sheet, world filters`

---

## SESSION 7 — Arc & Chapter Detail Screens
**Duration:** 3 hours | **Type:** Feature

**Say this to Claude Code:**
> "Build the arc detail and chapter detail screens.
>
> Arc Detail (app/arc/[id].tsx):
> - Full-bleed cover image header with gradient overlay (expo-linear-gradient)
> - Arc title in DM Serif Display (white, large), province + worldType chip below
> - Season badge: green 'Active Now' or amber 'Best: Nov–Apr'
> - Narrator intro: the local author's opening text in italic DM Serif
> - Chapter list: each chapter shows order number, title, coinReward, xpCategory chip, distance from user
> - 'Begin This Arc' CTA (POST /api/arcs/[id]/enroll)
> - If already enrolled: show progress (X of N chapters complete)
> - Shared element transition: cover image from the map bottom sheet (Expo Router shared transitions)
>
> Chapter Detail (app/arc/[id]/chapter/[chapterId].tsx):
> - Chapter title, arc name breadcrumb
> - Cover image
> - Distance indicator: real-time 'You are 1.2 km from this location' (update on mount from GPS)
> - 'Before You Go' card: dress code, best time, entry fee, etiquette — collapsible
> - Description
> - Lore text section: locked with a lock icon if not yet captured, unlocked with full text if captured
> - 'Capture This Moment' large CTA button → navigate to capture screen
>
> API endpoints needed: GET /api/arcs/[id], GET /api/arcs/[id]/chapters, POST /api/arcs/[id]/enroll"

**Commit message:** `feat: arc detail + chapter detail screens`

---

## SESSION 8 — The Capture Moment Flow (Most Important Session)
**Duration:** 4–5 hours | **Type:** Core Feature (the heart of the app)

**This is the most important session in Phase 1. Get it right.**

**Say this to Claude Code:**
> "Build the Capture Moment flow. This is the core interaction of the entire app.
>
> CAPTURE SCREEN (app/capture/[chapterId].tsx):
> - Full-screen expo-camera viewfinder (no UI chrome, immersive)
> - GPS captured silently on mount using expo-location (no user action required)
> - Bottom overlay (semi-transparent): chapter title in DM Serif Display, province name, distance 'You are X m from this location' updating every 3 seconds
> - One-line note input (appears on keyboard show, hidden otherwise): 'What are you feeling right now?' — placeholder only, truly optional
> - Circular shutter button in center-bottom: 80px diameter, white border, amber fill
> - Tap shutter → take photo → show preview overlay with photo filling screen, location name fades in (DM Serif Display, white, bottom third), 'Save This Moment' button + 'Retake' button
>
> API ENDPOINT: POST /api/capture (multipart/form-data)
> Pipeline in api/src/services/capture.service.ts:
>   1. PostGIS: verify GPS within chapter radius (ST_DWithin)
>   2. Upload photo to Cloudflare R2 (Sharp: 1200px, WebP 80%)
>   3. Drizzle: insert Capture record, update UserChapter progress
>   4. Calculate coins earned (base + bonuses)
>   5. Return immediately: { success, coinsEarned, xpEarned, badgeEarned, arcComplete, provinceComplete }
>   BullMQ background jobs (fire and forget from handler):
>     - Check badge conditions
>     - Create journal entry
>     - Create community post if isPublic
>     - Add passport stamp
>     - Update Redis leaderboard sorted set
>
> CELEBRATION SCREEN (shown after successful capture):
> - Coin rain animation: 10–14 Skia-drawn coin circles emit from bottom with arc physics, travel to coin counter top-right. Counter increments with spring. expo-haptics heavy impact.
> - Chapter title fades in: 'You captured: [title]'
> - XP gained bars animate in (5 small bars, one per category)
> - If badge earned: badge image slides in from right with 'New Badge' label
> - If arc complete: 'Arc Complete!' + hidden gem revealed message (local author's text)
> - If province complete: full province stamp animation (stamp press → ink spread)
> - Bottom: three buttons: 'View Passport', 'Share to Story', 'Keep Exploring'"

**Watch for:** The GPS verification radius. Start with 200 metres for testing. The Skia coin animation is the emotional peak — if it feels cheap, the whole completion flow falls flat. Spend time here.

**Commit message:** `feat: capture moment — camera flow, API pipeline, celebration animations`

---

## SESSION 9 — The Passport (The Book)
**Duration:** 3–4 hours | **Type:** Feature

**Say this to Claude Code:**
> "Build the Passport screen at `mobile/src/app/(tabs)/passport.tsx`. This is 'The Book'.
>
> Visual design:
> - Passport cover: deep burgundy (#6B2737) background, 'REPUBLIC OF SERENDIB' in DM Serif Display gold (#F1C40F), centred. A lotus SVG symbol below. User's name. Open button.
> - Book open animation: 2D perspective transform (Reanimated 4, rotateY from 90deg to 0deg with ease-out). Feels like opening a real passport.
> - Inside: vertical scroll of province pages
>
> Province page layout (one per province, 9 total):
> - Background: Coconut Cream (#F7F0E3) with SVG paper grain texture
> - Province name in DM Serif Display, province identifier text
> - Faint province outline illustration at 25% opacity (SVG, same paths as the map)
> - Stamps grid: 3 per row, each stamp is a circular image (chapter photo) with a hexagonal overlay mask, province colour border, chapter title below in tiny Space Grotesk, date captured
> - Unexplored chapters: grey placeholder circles with lock icon
> - Province completion: if all chapters captured, a large 'PROVINCE COMPLETE' stamp overlays the page (amber ink, DM Serif, rotated 12 degrees — like a real rubber stamp)
>
> Stamp press animation (when arriving from celebration screen):
> - The new stamp: scale from 1.4 to 0.9 (press) then spring to 1.0 (settle)
> - Ink spread: Skia radial fill from stamp center, 300ms ease-out
> - expo-haptics: heavy impact on press, medium on settle
>
> Stats bar at top of screen: total stamps, provinces explored (X/9), total coins earned
>
> API: GET /api/passport/me → returns all stamps grouped by province"

**Commit message:** `feat: passport — the book with province pages and stamp animations`

---

## SESSION 10 — Today Tab
**Duration:** 2–3 hours | **Type:** Feature

**Say this to Claude Code:**
> "Build the Today tab at `mobile/src/app/(tabs)/today.tsx`.
>
> This is the daily briefing. Layout is a scrollable card stack.
>
> Section 1 — Hero card:
> - User's location (reverse geocode from GPS): 'Kandy · Central Province'
> - Weather (OpenWeatherMap API, free tier): temperature + condition + icon
> - Time-of-day greeting: 'Good morning, Uditha' / 'Good evening'
> - Golden hour time: 'Golden hour: 6:14 PM' (calculate from lat/lng + date)
>
> Section 2 — Your Next Move (3 chapter cards):
> - Nearest 3 uncaptured chapters from enrolled arcs (sorted by distance from GPS)
> - If none enrolled: 3 highest-rated chapters in current province
> - Each card: chapter title, worldType icon, distance, coinReward, 'Active Now' if in season
> - Tap → chapter detail screen
>
> Section 3 — Today in Sri Lanka:
> - Poya day alert (full moon — fetch from lunar calendar or hardcode dates for 12 months)
> - Active seasonal events in current province (from seasonal_events table)
> - Example: 'Vesak Festival · All temples open tonight · Lanterns at dusk'
>
> Section 4 — Sinhala Today:
> - One phrase per day (rotate from a list of 60 phrases stored in app)
> - Romanised pronunciation + meaning
> - [Listen] button → play audio (store 60 short audio files in Cloudflare R2)
>
> Section 5 — Season Alert (if applicable):
> - If a bookmarked arc comes into season within 30 days: 'Whale watching season opens in 18 days — Mirissa is waiting'
>
> API: GET /api/today?lat=X&lng=Y → returns nearby chapters, active events, season alerts"

**Commit message:** `feat: today tab — daily briefing, nearby chapters, seasonal alerts`

---

## SESSION 11 — Your Story (Unified Journal + Community)
**Duration:** 3 hours | **Type:** Feature

**Say this to Claude Code:**
> "Build the Your Story tab at `mobile/src/app/(tabs)/story.tsx`.
>
> Two views toggled by a segmented control at top: 'My Journal' (private) and 'Community' (public).
>
> My Journal view:
> - Timeline list of the user's Captures, sorted by capturedAt desc
> - Each capture card: captured photo (full width, 200px height, rounded corners), chapter title in DM Serif, arc name + province, note text if exists, date in Space Grotesk caption, XP earned chips
> - Grouped by day with date headers ('Tuesday, April 9')
> - Tapping a capture → full detail modal: full photo, chapter lore text (now unlocked), map showing the capture location, all metadata
> - Empty state: illustrated traveller character looking at an empty journal, 'Your moments will appear here after your first capture'
>
> Community view:
> - Public captures from all users, sorted by capturedAt desc, filtered to user's current province first
> - Same card design but shows: user avatar circle, username, 'X ago'
> - Pull to refresh
> - 'Province' filter chip: toggle between 'Near You' and 'All Sri Lanka'
>
> A Capture becomes a journal entry AND a community post automatically. No separate 'write a post' action. The note from the capture screen IS the journal entry content.
>
> API: GET /api/story/me (private journal), GET /api/story/community?province=Central&page=1"

**Commit message:** `feat: your story — unified journal and community feed`

---

## SESSION 12 — Marketplace MVP
**Duration:** 4 hours | **Type:** Feature (revenue-critical)

**Say this to Claude Code:**
> "Build the marketplace MVP. This is the first revenue-generating feature.
>
> LOCAL GUIDE LISTING:
> - API: GET /api/marketplace/guides?province=X&worldType=Y
> - Guide card: photo, name, 'SerendiGO Certified' badge if certified, rating (stars), province, languages spoken, price from $X/half day, review count
> - Guide detail screen: full bio, photos, services offered (half day, full day, specialty), reviews, availability calendar (simple — show booked dates as unavailable)
> - 'Request Booking' button → booking request form: date, type (half/full day), group size, message
>
> BOOKING FLOW:
> - POST /api/bookings — creates booking record with status PENDING
> - Guide notified (we'll do push notifications in Phase 2 — for now, admin sees it in Payload CMS)
> - Traveller sees booking confirmation screen with booking reference
> - Stripe payment: charge 50% deposit upfront, 50% after completion
>
> PROVIDER SIDE (in Payload CMS admin, not mobile):
> - Guides apply via a form in the admin panel
> - Admin reviews and marks as Certified
> - Guide sets their price + available provinces + languages
>
> Marketplace tab accessible from Today tab quick action ('Find a Guide') and from Arc detail ('Book a guide for this arc')
>
> Commission: 12% deducted from Stripe capture. Remaining 88% to guide via Stripe Connect (set up Stripe Connect Express accounts for guides)."

**Commit message:** `feat: marketplace MVP — guide listings, booking, Stripe payments`

---

## SESSION 13 — Gamification Layer
**Duration:** 2–3 hours | **Type:** Feature

**Say this to Claude Code:**
> "Build the gamification systems that tie everything together.
>
> SERENDIPITY COINS:
> - Coin balance in header on all screens (Today, The Island, Story, Passport)
> - Coin history screen: list of earn events with: icon, description, amount, date
> - API: GET /api/coins/history
>
> BADGE SYSTEM:
> - Backend: BullMQ worker checks badge conditions after every capture
> - Badge conditions (in api/src/services/badges.service.ts):
>   - 'First Capture': first chapter ever captured
>   - 'Food Connoisseur': 5 TASTE chapters captured
>   - 'Wildlife Watcher': 5 WILD chapters captured
>   - 'Trail Runner': 5 MOVE chapters captured  
>   - 'Culture Keeper': 5 ROOTS chapters captured
>   - 'Seeker': 5 RESTORE chapters captured
>   - 'Province Explorer': complete 1 province
>   - Province-specific badges: complete all chapters in each province
> - Badge earned notification: push notification + celebration on next app open
> - Badge screen: grid of all badges, earned (full colour) vs unearned (greyed, locked)
>
> LEADERBOARD:
> - Redis sorted set: zScore = total serendipity coins earned
> - Two views: 'This Week' (reset every Monday) + 'This Province' (filtered)
> - No all-time global board in Phase 1
> - User's own rank always visible at bottom of list even if outside top 20
> - API: GET /api/leaderboard?type=week&province=Central
>
> LEVEL SYSTEM:
> - Level calculated from total coins: 0–200 = Level 1 'Island Novice', 201–500 = Level 2, etc.
> - Level title shown on Passport cover and Today tab header
> - Level up: celebration animation on next app open after crossing threshold"

**Commit message:** `feat: gamification — coins, badges, leaderboard, levels`

---

## SESSION 14 — Seasonal System & Content Seeding
**Duration:** 2 hours | **Type:** Data + Feature

**Say this to Claude Code:**
> "Implement the seasonal arc system and seed the first real content.
>
> SEASONAL SYSTEM:
> - Drizzle: arcs.seasonStart (1–12 month number), arcs.seasonEnd, arcs.isSeasonal
> - API: when returning arcs, add computed field isActiveNow = current month between seasonStart and seasonEnd (handle wrap-around: Nov=11, Apr=4 → active in months 11,12,1,2,3,4)
> - Mobile: 'Active Now' green chip on in-season arcs. Out-of-season: amber chip 'Best: [months]'
> - Bookmark feature: heart icon on arc card. Bookmarked arcs checked against season calendar for notifications
>
> SEED FIRST ARCS (minimum viable content for launch):
> Create Drizzle seed file with 5 arcs, one per world type, all in different provinces:
>
> 1. TASTE — 'The Colombo Street Food Circuit' — Western Province
>    Chapters: Galle Face Green evening snacks, Pettah kottu by sound, Majestic City hoppers at dawn
>
> 2. WILD — 'Elephants of Minneriya' — North Central Province  
>    Chapters: Dawn jeep safari, The gathering at the tank, Baby elephant encounter
>    Season: August–October
>
> 3. MOVE — 'Surf Weligama' — Southern Province
>    Chapters: First lesson on the beach, Sunset session, The fish-and-chips debrief
>    Season: November–April
>
> 4. ROOTS — 'Sigiriya and the Lost Kingdom' — Central Province
>    Chapters: Climb at sunrise (start 5:30am), The frescoes, Pidurangala view
>
> 5. RESTORE — 'Tea Country Slow' — Central Province
>    Chapters: Factory visit, Tea tasting session, Sunrise walk through the estate
>
> Add all 9 province polygons (GeoJSON) and their stamp design keys to provinces seed."

**Commit message:** `feat: seasonal system + first 5 arcs seeded`

---

## SESSION 15 — Polish, Error States & Phase 1 QA
**Duration:** 3 hours | **Type:** QA + Polish

**Say this to Claude Code:**
> "Phase 1 QA pass. Go through every screen and check:
>
> 1. Every loading state has a skeleton screen (not a spinner) using the brand amber/cream palette
> 2. Every error state has an illustrated empty state (not generic grey text)
> 3. Every network request has an error boundary — if the API fails, the screen degrades gracefully
> 4. Offline detection: if @react-native-community/netinfo shows no connection, show a subtle 'You're offline — showing cached content' banner
> 5. GPS permission denied: graceful fallback — hide distance info, don't crash
> 6. Camera permission denied: show a permissions explanation screen before the capture flow
> 7. All text uses DM Serif Display or Space Grotesk — no system fonts
> 8. All colours are from the theme file — no hardcoded hex values in component files
> 9. Dark mode: all screens should respect the system theme. Test by switching device to dark mode.
> 10. The Island map: test on a small screen (iPhone SE) and a large screen (iPhone 15 Pro Max) — province polygons should scale correctly
>
> Also: set up Sentry in both mobile and API. Add PostHog basic event tracking: arc_enrolled, chapter_captured, booking_requested, app_opened."

**Commit message:** `chore: Phase 1 QA — error states, offline handling, accessibility`

---

# PART 3 — Phase 2 Sessions (Months 4–6)

*Goal: The community layer, AI trip planner, offline mode, subscriptions.*

These sessions are shorter to describe because by now you know the codebase. The patterns are established.

---

## SESSION 16 — Conversational AI Trip Planner
**Duration:** 4 hours

**Say this:**
> "Build the conversational AI trip planner. A 4-turn conversation with GPT-4o that ends in a day-by-day itinerary.
>
> Screen: app/trip-planner/index.tsx — a chat UI. Messages appear from bottom. The AI is 'Serendib AI, your personal Sri Lanka guide'.
>
> Turn 1: 'Hey! I'm your Sri Lanka guide. Where are you flying in to, and when do you arrive?'
> Turn 2: 'Got it — X days in Sri Lanka. Tell me: wildlife or ancient history, if you had to pick one?'
> Turn 3 (if needed): 'Do you want to cover multiple regions or go deep in one area?'
> Final: API call to POST /api/trip-planner/generate with all conversation context
>
> Backend: GPT-4o system prompt includes: all active arcs with provinces and worldTypes, seasonal data for the travel dates, province geography. Output: structured JSON itinerary (day, morning/afternoon/evening, arc recommendations per slot, suggested base location).
>
> Result screen: day-by-day cards. Each day slot shows the arc recommendation with a 'Enroll in this arc' button. Tapping enrolls them immediately. The AI itinerary and the game are now connected."

**Commit message:** `feat: conversational AI trip planner with arc enrollment`

---

## SESSION 17 — Offline Arc Download
**Duration:** 3–4 hours

**Say this:**
> "Implement offline arc download with WatermelonDB.
>
> WatermelonDB schema in mobile/src/db/: tables for Arc, Chapter, Capture (cached), PassportStamp (cached). Sync adapter that pulls from the API.
>
> 'Download Arc' button on arc detail screen. On tap:
> - Fetch full arc + all chapters + cover images (Cloudflare Images: 800px compressed)
> - Store in WatermelonDB
> - Download chapter photos as base64 or file cache
> - Show download progress bar
>
> When netinfo shows offline:
> - Read arcs/chapters from WatermelonDB instead of API
> - Capture flow: store capture locally (photo in file cache, metadata in WatermelonDB)
> - Show 'Offline — capture will sync when you reconnect' on the celebration screen
> - On reconnect: background sync worker submits queued captures to POST /api/capture
> - Optimistic UI: passport stamp and coin count updated locally immediately, reconciled on sync"

**Commit message:** `feat: offline arc download and queued capture sync`

---

## SESSION 18 — Local Author Program
**Duration:** 3 hours

**Say this:**
> "Build the Local Author submission flow.
>
> Mobile: 'Share your place' entry point in the Passport tab (bottom of screen). Multi-step form:
> Step 1: Your connection to this place (text, 200 char max)
> Step 2: Location name + province
> Step 3: Add 3–7 chapters (title, description, location on map tap, photo)
> Step 4: Narrator intro (who are you? what makes this place special to you?)
> Submit → POST /api/local-authors/submit
>
> Admin (Payload CMS): Local Author Submissions collection. Review queue. Approve/Reject with feedback. On approve: arc auto-created with arcType='LOCAL_AUTHOR', authorUserId set, attribution text stored.
>
> Author attribution shown on arc detail: 'Written by [name], from [place], who has lived here for [X] years'. DM Serif italic."

**Commit message:** `feat: local author program — submission flow + admin review`

---

## SESSION 19 — Explorer+ Subscription
**Duration:** 2–3 hours

**Say this:**
> "Implement the Explorer+ subscription.
>
> Three plans: Day Pass $1.99, Week Pass $4.99, Month $9.99. Stripe Checkout or in-app purchase (StoreKit for iOS, Google Play Billing for Android — use expo-in-app-purchases or react-native-purchases/RevenueCat).
>
> Recommendation: use RevenueCat to abstract iOS/Android subscription differences. It handles receipt validation, entitlement management, and webhooks.
>
> Entitlement 'explorer_plus' gates:
> - Offline arc download button (visible but locked behind paywall)
> - Insider Arcs (arcs with arcType='INSIDER' only visible to subscribers)
> - Passport PDF export button
> - Flash Deals (shown without coin threshold)
>
> Paywall screen: shown when user taps a gated feature. Shows the three plans, comparison of free vs Explorer+. 'Start Week Pass' as primary CTA."

**Commit message:** `feat: Explorer+ subscription via RevenueCat`

---

## SESSION 20 — Community Fund + Province Presence
**Duration:** 3 hours

**Say this:**
> "Two features:
>
> 1. COMMUNITY FUND: Fund Projects screen (from Passport tab → 'Community Fund' button). Shows: total fund balance (2% of all marketplace GMV, tracked in a fund_balance table), current quarter's projects with voting progress bars, past funded projects with outcome photos. Vote button: POST /api/fund/vote. User can vote once per quarter, requires at least 1 completed chapter.
>
> 2. PROVINCE PRESENCE: Real-time 'N travellers in [Province] right now'.
> Use Ably (or Supabase Realtime if already set up). On app foreground, publish user's current province to a presence channel. Subscribe to the province channel to get a live count. Show on The Island map: a small badge on each province '3 here now'. Show in Today tab: 'You're in Central Province with 4 other travellers'."

**Commit message:** `feat: community fund voting + province presence realtime`

---

# PART 4 — Phase 3 Sessions (Months 7–12)

Phase 3 sessions are planned after Phase 2 completion. By then you'll have real user data to guide priorities. The sessions are:

- **S21:** Full marketplace (cooking classes, diving, Ayurveda, accommodation)
- **S22:** Passport PDF export (server-side, Puppeteer + branded template)
- **S23:** Trip recap card (shareable visual, 9:16 + square format)
- **S24:** Proximity push notifications (expo-location background geofence)
- **S25:** Semantic arc recommendations (pgvector, embedding-based)
- **S26:** Tourism Board content partnership (official arc type, co-branding)
- **S27:** Domestic traveller mode (LKR-first, Sinhala UI, different onboarding)
- **S28:** Senior Local Guide certification flow
- **S29:** Analytics dashboard (PostHog + Payload CMS reporting)
- **S30:** Performance optimization + App Store preparation

---

# PART 5 — How to Run Each Type of Session

---

## Architecture Sessions (Planning major features)

Use **Plan Mode** before writing code for complex features.

```
Start session with:
"Before we write any code, let's design this. Enter plan mode.
I want to build [feature]. It needs to:
- [requirement 1]
- [requirement 2]
Please map out: what files we need to create, what the data flow is,
what API endpoints are needed, and any risks or edge cases to consider.
Don't write any code yet."
```

Review the plan. Adjust it. Then say:
```
"The plan looks good. Let's implement it step by step, starting with [file/component]."
```

---

## Debugging Sessions

When something breaks, don't start a new session. Give Claude Code the full context:

```
"Something is broken. Here's exactly what's happening:
1. I do [action]
2. I expect [expected behaviour]
3. I get [actual behaviour / error message]

Relevant files: [list them]
Recent changes: [what you changed before it broke]

Don't guess — read the files first, then diagnose."
```

---

## Database Sessions

Always start with:
```
"Before making schema changes, read api/src/db/schema/ completely.
Then [make change]. Warn me of any breaking changes.
Generate and show me the migration SQL before running it."
```

---

## UI Polish Sessions

When you have working code but it doesn't look right:

```
"The [screen/component] works functionally but the design isn't right.
The vision is [describe from SERENDIGO_VISION.md].
Currently it looks [describe issue].
Read the screen file and the theme file, then fix:
- [specific visual issue 1]
- [specific visual issue 2]
Don't change any logic, only visual/styling code."
```

---

## Performance Sessions

```
"Profile the [screen]. It's slow when [situation].
Read the component. Identify:
1. Any TanStack Query fetches that could be parallelised
2. Any re-renders that could be prevented with useMemo/useCallback
3. Any Reanimated animations using JS thread instead of UI thread
4. Any large images not using Cloudflare Images resize params
Fix the issues one at a time, explain each change."
```

---

## Content Sessions (Adding Arcs)

Use the `/new-arc` command:
```
/new-arc

I want to add: 'The Southern Seafood Coast' arc.
World type: TASTE
Province: Southern
Season: Year-round (seafood is always available)
Narrator: Lakshmi, who runs a beachside restaurant in Tangalle

Chapters:
1. Negombo fish market at dawn (lat: 7.2094, lng: 79.8383)
2. Learn to cook fish ambul thiyal in Galle (lat: 6.0328, lng: 80.2170)
3. Fresh crab at a Mirissa beach shack (lat: 5.9483, lng: 80.4567)

Generate the Drizzle seed insert statements.
```

---

# PART 6 — Daily Working Habits with Claude Code

---

## The Pre-Session Checklist (Do This Every Time)

```
Before opening Claude Code:
□ Know the ONE thing you want to finish this session
□ Have the relevant section of SERENDIGO_VISION.md open
□ Run git status — is yesterday's work committed?
□ Update CLAUDE.md "Current focus" if needed
□ Have your .env files ready if setting up new services
```

---

## The Commit Strategy

Commit after every logical unit — not at the end of a session. Small commits are reviewable. Giant commits lose context.

```
Good commits (one feature at a time):
  feat: capture endpoint — GPS verification with PostGIS
  feat: capture endpoint — photo upload to Cloudflare R2
  feat: capture celebration — coin rain Skia animation
  feat: capture celebration — passport stamp ink animation

Bad commit:
  feat: everything for the capture feature
```

Ask Claude Code to commit for you:
```
"Commit what we just built with an appropriate message."
```

---

## Context Window Management

Claude Code's context fills up during long sessions. Signs it's getting full:
- Responses get slower
- Claude Code starts forgetting earlier decisions
- It starts re-reading files it already read

When this happens:
```
"Before we continue, update CLAUDE.md with everything important
we've established this session. Then we'll do a fresh start."
```

Start a new session. CLAUDE.md carries the knowledge forward.

---

## When Claude Code Makes a Wrong Decision

Correct it immediately and specifically:

```
Good: "That's wrong — you used Prisma but we're using Drizzle. 
      Read api/src/db/schema/arcs.ts and redo this with Drizzle syntax."

Bad: "That doesn't look right, can you try again?"
```

The more specific your correction, the better the fix.

---

## When You Don't Understand Something Built

Never accept code you don't understand:
```
"Before we move on, explain this function to me in plain terms.
What does it do, why is it structured this way, and what would
break if we removed it?"
```

Understanding your own codebase is not optional.

---

## Protecting Production

Create this rule in your mind and never break it:

```
Never ask Claude Code to:
  - git push to main
  - run migrations on the production database
  - delete data
  - change environment variables
without you explicitly reviewing and approving each step.

Claude Code works in your local environment. You push to production.
```

---

# PART 7 — Prompt Templates Library

Copy and adapt these for common tasks.

---

**Start a feature from scratch:**
```
"Build [feature name] for SerendiGO.

It needs to do: [user-facing behaviour]

Files to create:
- [mobile path] — [what it does]
- [api path] — [what it does]

Connect to these existing files:
- [existing file] — for [purpose]

Follow our conventions: Expo Router, Drizzle ORM, Hono handlers → services,
all colours from theme/index.ts, DM Serif Display for display text."
```

---

**Add an API endpoint:**
```
"Add endpoint: [METHOD] /api/[path]

Purpose: [what it returns/does]
Auth required: yes/no
Query params: [list]
Response shape: { [fields] }

Create the Hono route, handler, and service. No logic in the handler."
```

---

**Fix a bug:**
```
"Bug: When I [action], I get [error/wrong behaviour].

Read [file 1] and [file 2]. Find the cause.
Don't fix it until you've explained to me what's wrong and why."
```

---

**Improve performance:**
```
"The [screen] is slow. Read [file]. 
Optimise only — don't change functionality.
Explain every change you make."
```

---

**Add seed data:**
```
"Add seed data for [arc name]. 
World type: [type]. Province: [province].
Chapters: [list with lat/lng]
Use Drizzle insert syntax matching our schema in api/src/db/schema/."
```

---

**Deploy prep:**
```
"Prepare for deployment to [environment].
Check: TypeScript errors (bun tsc --noEmit), 
unused imports, any hardcoded localhost URLs,
missing environment variable checks on startup,
Drizzle migrations that need to run.
Don't deploy — just identify and fix issues."
```

---

# PART 8 — What NOT to Do

These are the traps that slow development or create technical debt.

---

**Don't ask Claude Code to build everything at once**
```
Bad:  "Build the entire marketplace feature"
Good: "Build the guide listing screen. Just the UI, no booking yet."
```

---

**Don't skip the CLAUDE.md update**
If you establish a pattern, a convention, or a decision in one session and don't write it into CLAUDE.md, the next session starts from scratch on that decision.

---

**Don't accept placeholder code as finished**
```
// TODO: implement this
throw new Error('Not implemented')
```
If Claude Code generates these, call them out immediately.

---

**Don't let sessions run without commits**
A 4-hour session with no commits means if something goes wrong, you lose 4 hours.

---

**Don't use Claude Code for content decisions**
If you're unsure whether a feature belongs in the app, don't ask Claude Code — it will build it. Check SERENDIGO_VISION.md. That document has the answer. Claude Code builds; SERENDIGO_VISION.md decides.

---

**Don't ignore TypeScript errors**
```
// @ts-ignore
// @ts-expect-error
```
These are red flags. Every time Claude Code suppresses a TypeScript error, ask it to fix the type properly instead.

---

# PART 9 — The Build Order Summary

```
PHASE 1 — The Living Guide (Months 1–3)
─────────────────────────────────────────
S1   Project scaffolding (3 repos, running)
S2   Database schema + Supabase
S3   Authentication (email + Google + Apple)
S4   Onboarding flow (traveller character quiz)
S5   Island map — province SVG layer
S6   Island map — arc pins + discovery
S7   Arc + chapter detail screens
S8   Capture Moment flow ← MOST IMPORTANT
S9   The Passport (The Book)
S10  Today tab
S11  Your Story (journal + community)
S12  Marketplace MVP (guide bookings)
S13  Gamification (coins, badges, leaderboard)
S14  Seasonal system + first arc content
S15  Phase 1 QA + polish

PHASE 2 — The Community (Months 4–6)
─────────────────────────────────────────
S16  Conversational AI trip planner
S17  Offline arc download (WatermelonDB)
S18  Local Author program
S19  Explorer+ subscription (RevenueCat)
S20  Community Fund + province presence

PHASE 3 — The Platform (Months 7–12)
─────────────────────────────────────────
S21  Full marketplace
S22  Passport PDF export
S23  Trip recap shareable card
S24  Proximity notifications
S25  Semantic recommendations
S26  Tourism Board content
S27  Domestic traveller mode
S28  Senior guide certification
S29  Analytics dashboard
S30  App Store launch preparation
```

---

# PART 10 — The One Rule

**Every session, know the answer to this before you start:**

*"What will be different when this session ends?"*

If you can't answer that specifically, the session will drift. If you can answer it clearly, Claude Code will deliver it.

---

*This guide lives alongside your code. Update it when sessions produce insights, patterns, or decisions worth remembering. It compounds in value the more sessions you run.*