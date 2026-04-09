# SerendiGO — Milestone Development Plan

## How This Works

Every milestone follows this pattern:

```
┌─────────────────────────────────────────────────┐
│  MILESTONE X: [Name]                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  📋 GOAL                                        │
│  What you're building                           │
│                                                 │
│  💬 SAY THIS TO CLAUDE CODE                     │
│  Exact prompt to copy/paste                     │
│                                                 │
│  👁️ WHAT YOU'LL SEE                            │
│  Visual checkpoints to verify                   │
│                                                 │
│  ✅ TEST YOURSELF                               │
│  Actions to confirm it works                    │
│                                                 │
│  📝 COMMIT MESSAGE                              │
│  What to save                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Rule:** You don't move to the next milestone until you've seen it working with your own eyes.

---

# FOUNDATION (Milestones 1-4)

---

## MILESTONE 1: Expo App Running

### 📋 GOAL
See the Expo app running on your phone with the default template

### 💬 SAY THIS TO CLAUDE CODE
```
Create a new Expo project for SerendiGO using the latest Expo SDK.

Requirements:
- Use Expo Router for navigation
- TypeScript enabled
- Create in apps/mobile/ directory

Just the basic template for now - we'll add our packages next.
Show me the exact commands to run.
```

### 👁️ WHAT YOU'LL SEE
- Terminal shows: `npx expo start` with QR code
- Expo Go app scans QR → app loads
- Default Expo welcome screen appears
- "Open up App.js to start working on your app!"

### ✅ TEST YOURSELF
- [ ] Shake phone → Developer menu appears
- [ ] Edit `app/index.tsx` → Hot reload shows change
- [ ] App doesn't crash on reload

### 📝 COMMIT
```
git add .
git commit -m "feat: expo project initialized with expo router"
```

---

## MILESTONE 2: Four Tabs Navigation

### 📋 GOAL
See the four SerendiGO tabs: Today, The Island, Your Story, Passport

### 💬 SAY THIS TO CLAUDE CODE
```
Set up Expo Router tab navigation with four tabs.

Tabs:
1. Today (sun icon) - app/(tabs)/index.tsx
2. The Island (map-pin icon) - app/(tabs)/island.tsx  
3. Your Story (book-open icon) - app/(tabs)/story.tsx
4. Passport (stamp icon) - app/(tabs)/passport.tsx

Each tab just shows its name centered on screen for now.

Use these colors from our vision doc:
- Background: #F7F0E3 (Coconut Cream)
- Active tab: #E8832A (Temple Amber)
- Inactive tab: #5A5A7A (Text Secondary)

Install @expo/vector-icons if needed for the icons.
```

### 👁️ WHAT YOU'LL SEE
- Four tabs at the bottom of screen
- Tap "The Island" → screen shows "The Island"
- Active tab icon is amber colored
- Background is warm cream color

### ✅ TEST YOURSELF
- [ ] Tap each tab rapidly - no lag
- [ ] Active tab changes color
- [ ] Tab labels are readable
- [ ] Background is #F7F0E3 not white

### 📝 COMMIT
```
git commit -m "feat: four tab navigation with serendigo colors"
```

---

## MILESTONE 3: Fonts Loading

### 📋 GOAL
See DM Serif Display and Space Grotesk fonts rendering correctly

### 💬 SAY THIS TO CLAUDE CODE
```
Install and configure the SerendiGO fonts:

1. Install: @expo-google-fonts/dm-serif-display
2. Install: @expo-google-fonts/space-grotesk

Create a theme file at src/theme/index.ts with:
- Font families exported
- All colors from our vision doc

On the Today tab, show:
- "Good morning" in DM Serif Display, 28px (title font)
- "Your Sri Lanka adventure awaits" in Space Grotesk, 16px (body font)

Use useFonts hook and show loading screen until fonts ready.
```

### 👁️ WHAT YOU'LL SEE
- Brief splash while fonts load
- "Good morning" in elegant serif font
- Subtitle in clean sans-serif font
- Two distinctly different font styles

### ✅ TEST YOURSELF
- [ ] Kill app completely, reopen - fonts load without flash
- [ ] Fonts don't fall back to system fonts
- [ ] Text is crisp on device

### 📝 COMMIT
```
git commit -m "feat: dm serif display and space grotesk fonts"
```

---

## MILESTONE 4: Theme System

### 📋 GOAL
Complete theme system with all colors, spacing, typography

### 💬 SAY THIS TO CLAUDE CODE
```
Expand the theme file at src/theme/index.ts with the complete design system.

Colors from vision doc:
- primary: '#E8832A' (Temple Amber)
- secondary: '#1A6B7A' (Ocean Teal)
- surface: '#F7F0E3' (Coconut Cream)
- surfaceWhite: '#FDFAF5' (Warm White)
- background: '#1C1A2E' (Night - for dark mode)
- textPrimary: '#1A1A2E'
- textSecondary: '#5A5A7A'
- textTertiary: '#9A9AB0'

World colors:
- taste: '#E67E22'
- wild: '#27AE60'
- move: '#2980B9'
- roots: '#8E44AD'
- restore: '#F39C12'

Gamification:
- coinGold: '#F1C40F'
- success: '#27AE60'
- warning: '#E67E22'
- error: '#E74C3C'

Typography scale:
- display: 40px DM Serif
- h1: 28px DM Serif
- h2: 22px Space Grotesk SemiBold
- h3: 18px Space Grotesk SemiBold
- body: 16px Space Grotesk
- caption: 13px Space Grotesk
- label: 11px Space Grotesk uppercase

Apply to all tab screens so they use theme values.
```

### 👁️ WHAT YOU'LL SEE
- All screens have consistent warm cream backgrounds
- Text colors match the design system
- No hardcoded colors in component files

### ✅ TEST YOURSELF
- [ ] Theme values imported, not hardcoded hex
- [ ] Colors feel warm and cohesive
- [ ] Matches the vision doc palette

### 📝 COMMIT
```
git commit -m "feat: complete theme system with colors and typography"
```

---

# THE ISLAND MAP (Milestones 5-8)

---

## MILESTONE 5: Sri Lanka Shape

### 📋 GOAL
See the outline of Sri Lanka rendered as SVG on The Island tab

### 💬 SAY THIS TO CLAUDE CODE
```
On The Island tab, render an SVG outline of Sri Lanka.

Requirements:
- Install react-native-svg
- Get simplified Sri Lanka country border coordinates
- Render as SVG path
- Fill with Coconut Cream (#F7F0E3)
- Stroke with Temple Amber (#E8832A), 2px width
- Center on screen with padding

Just the country outline for now, no provinces yet.
```

### 👁️ WHAT YOU'LL SEE
- Recognizable Sri Lanka island shape
- Amber border line
- Centered and properly sized
- Cream fill color

### ✅ TEST YOURSELF
- [ ] Shape looks like Sri Lanka
- [ ] Compare to Google Maps - accurate outline
- [ ] Looks good on different phone sizes

### 📝 COMMIT
```
git commit -m "feat: sri lanka svg outline on island map"
```

---

## MILESTONE 6: Nine Provinces

### 📋 GOAL
See all 9 provinces as separate tappable regions

### 💬 SAY THIS TO CLAUDE CODE
```
Split the Sri Lanka SVG into 9 province polygons.

Provinces needed:
1. Western (Colombo area)
2. Central (Kandy)
3. Southern (Galle)
4. Northern (Jaffna)
5. Eastern (Trincomalee)
6. North Western (Kurunegala)
7. North Central (Anuradhapura)
8. Uva (Badulla)
9. Sabaragamuwa (Ratnapura)

Each province:
- Separate SVG path element
- Tappable with onPress
- Shows province name in a toast when tapped
- Filled with light grey (#E5E5E0) for now
- Amber stroke between provinces

Get real province boundary coordinates from GeoJSON.
```

### 👁️ WHAT YOU'LL SEE
- Nine distinct province shapes
- Thin borders between them
- Tap Central Province → toast shows "Central Province"
- All provinces tappable

### ✅ TEST YOURSELF
- [ ] Tap all 9 provinces - each shows correct name
- [ ] Borders are clean, no gaps
- [ ] Province shapes are geographically accurate

### 📝 COMMIT
```
git commit -m "feat: nine province polygons with tap detection"
```

---

## MILESTONE 7: Pan and Zoom

### 📋 GOAL
Pinch to zoom, drag to pan the map smoothly

### 💬 SAY THIS TO CLAUDE CODE
```
Add gesture handling to The Island map.

Install:
- react-native-gesture-handler
- react-native-reanimated

Implement:
- Pinch to zoom (min 1x, max 4x scale)
- Drag to pan
- Double-tap to zoom in
- Smooth 60fps animations using Reanimated worklets

The map should feel responsive like Google Maps.
Wrap the app in GestureHandlerRootView.
```

### 👁️ WHAT YOU'LL SEE
- Pinch with two fingers → map zooms smoothly
- Drag with one finger → map pans
- Double-tap → zooms to that point
- Release → no sudden jumps

### ✅ TEST YOURSELF
- [ ] Zoom all the way in, pan around - stays smooth
- [ ] Zoom out completely - snaps back nicely
- [ ] No jank or stutter during gestures

### 📝 COMMIT
```
git commit -m "feat: pan and zoom gestures on island map"
```

---

## MILESTONE 8: Province Bottom Sheet

### 📋 GOAL
Tap province → bottom sheet slides up with details

### 💬 SAY THIS TO CLAUDE CODE
```
When a province is tapped, show a bottom sheet.

Build a custom bottom sheet using Reanimated (no library):
- Slides up from bottom with spring animation
- Shows: Province name (DM Serif), "5 arcs available" 
- "Explore" button
- Drag down to dismiss
- Tap outside to dismiss
- 30% of screen height

Don't use react-native-bottom-sheet library - build it ourselves
for learning and control.
```

### 👁️ WHAT YOU'LL SEE
- Tap Central Province → sheet slides up smoothly
- Province name in DM Serif Display
- "5 arcs available" text
- Explore button visible
- Drag down → dismisses

### ✅ TEST YOURSELF
- [ ] Open/close rapidly - no animation glitches
- [ ] Sheet doesn't block tab bar
- [ ] Works on different screen sizes

### 📝 COMMIT
```
git commit -m "feat: province bottom sheet with reanimated"
```

---

# BACKEND (Milestones 9-11)

---

## MILESTONE 9: API Running

### 📋 GOAL
Bun + Hono backend responding to requests

### 💬 SAY THIS TO CLAUDE CODE
```
Create the SerendiGO API backend.

In apps/api/ directory:
- Bun runtime
- Hono framework
- TypeScript strict mode

Create basic structure:
- src/index.ts - main entry
- src/routes/ - route definitions
- src/handlers/ - request handlers
- src/services/ - business logic

Single endpoint for now:
GET /health → { status: "ok", timestamp: "..." }

Show me the commands to run it.
```

### 👁️ WHAT YOU'LL SEE
- Terminal: `bun dev` → "Server running on http://localhost:3000"
- Browser: localhost:3000/health → JSON response
- No errors in terminal

### ✅ TEST YOURSELF
- [ ] `curl http://localhost:3000/health` returns JSON
- [ ] Kill server → requests fail
- [ ] Restart → requests work

### 📝 COMMIT
```
git commit -m "feat: bun hono api with health endpoint"
```

---

## MILESTONE 10: Mobile Fetches API

### 📋 GOAL
Mobile app successfully fetches data from the API

### 💬 SAY THIS TO CLAUDE CODE
```
Connect the mobile app to the API.

Install on mobile:
- @tanstack/react-query

Create:
- src/services/api.ts - base fetch configuration
- src/hooks/useApi.ts - TanStack Query hooks

API endpoint:
GET /api/today → { greeting: "Good morning", location: "Colombo" }

On Today tab:
- Fetch using TanStack Query
- Show loading state (skeleton, not spinner)
- Display greeting and location from API
- Handle error state

Use environment variable for API URL.
```

### 👁️ WHAT YOU'LL SEE
- App loads → brief skeleton loading state
- Then shows "Good morning" and "Colombo"
- Data comes from API (check network tab)

### ✅ TEST YOURSELF
- [ ] Change API response → app shows new data after refresh
- [ ] Stop API server → error state shows
- [ ] Restart API → pull to refresh works

### 📝 COMMIT
```
git commit -m "feat: mobile fetches from api with tanstack query"
```

---

## MILESTONE 11: Database Connected

### 📋 GOAL
API reads/writes to Supabase PostgreSQL via Drizzle ORM

### 💬 SAY THIS TO CLAUDE CODE
```
Connect the API to Supabase using Drizzle ORM.

Install:
- drizzle-orm
- drizzle-kit
- postgres (for pg client)

Setup:
- src/db/index.ts - database connection
- src/db/schema/provinces.ts - first schema
- drizzle.config.ts - migration config

Create provinces table:
- id (text, primary key)
- name (text, not null)
- slug (text, unique)

Seed all 9 Sri Lanka provinces.

Endpoint:
GET /api/provinces → returns all provinces from database

Use Supabase connection string from environment.
```

### 👁️ WHAT YOU'LL SEE
- Supabase dashboard shows 'provinces' table
- 9 rows of province data
- API endpoint returns all provinces
- Mobile can fetch and display list

### ✅ TEST YOURSELF
- [ ] Add a test province in Supabase → API returns 10
- [ ] Delete test → API returns 9
- [ ] Database credentials not in code (env vars)

### 📝 COMMIT
```
git commit -m "feat: drizzle orm connected to supabase"
```

---

# Continue to Full Plan...

The complete milestone plan continues through:

**AUTHENTICATION (12-14)**
- Registration screen
- Auth API endpoints  
- Mobile auth flow

**ONBOARDING (15-16)**
- Personality quiz UI
- Character assignment

**ARCS & CHAPTERS (17-20)**
- Database schema
- Arc pins on map
- Arc detail screen
- Chapter detail screen

**CAPTURE MOMENT (21-24)**
- Camera screen
- Take photo
- Submit to API
- Celebration animation

**PASSPORT (25-28)**
- Passport cover
- Book opens
- Stamps appear
- Stamp animation

**TODAY TAB (29-30)**
- Weather & location
- Nearby chapters

---

## Quick Reference: What to Say

### Starting a session:
```
"I'm starting Milestone X: [Name].
Read CLAUDE.md and let's build this."
```

### When something doesn't work:
```
/debug

Expected: [what should happen]
Actual: [what happens instead]
Changed: [what you changed before it broke]
```

### Before moving on:
```
/test-milestone

Milestone X: [Name]
✓ [thing that works]
✓ [thing that works]  
✗ [thing that doesn't work]
```

### Ending a session:
```
"Update CLAUDE.md with what we accomplished.
Commit everything.
What's next?"
```
