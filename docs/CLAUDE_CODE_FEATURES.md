# Claude Code Features Reference for SerendiGO

## Quick Reference Table

| Feature | When to Use | How to Invoke |
|---------|-------------|---------------|
| CLAUDE.md | Every session (auto-read) | Create at project root |
| /commands | Repeatable workflows | Create in `.claude/commands/` |
| Plan Mode | Before complex features | "Let's plan this before coding" |
| Memory | Persists decisions | "Remember this about our project..." |
| Web Search | Find docs, latest APIs | "Search for Expo SDK 52 changes" |
| File Reading | Understand existing code | "Read the capture service" |
| Multi-file Edit | Coordinated changes | "Update all screens to use new theme" |
| Git Integration | Version control | "Commit this with message..." |
| GitHub PRs | Code review | "Create a PR for this feature" |

---

## Feature 1: CLAUDE.md (Project Brain)

**What it does:** Claude Code reads this file at the START of every session. It's your project's permanent memory.

**Location:** `/serendigo/CLAUDE.md`

**What to put in it:**
```markdown
# Project Name

## What This Is
One paragraph explaining the project

## Current Phase
Where you are in development

## Tech Stack
Brief list of technologies

## Code Conventions  
Your coding standards

## Current Session Memory
Updated by Claude Code each session

## Important Decisions Made
Architectural decisions log
```

**How to use it:**
1. Claude Code reads it automatically
2. Ask Claude to "update CLAUDE.md with what we learned"
3. Check it before each session to see where you left off

---

## Feature 2: Custom Commands (/commands)

**What it does:** Reusable workflows you can invoke with `/command-name`

**Location:** `.claude/commands/`

**Commands we've created:**

### /new-screen
Creates a new mobile screen with correct structure
```
/new-screen

Create the Passport screen at app/(tabs)/passport.tsx
It needs to show: user's stamps, province progress, achievements
```

### /new-endpoint  
Creates an API endpoint following our architecture
```
/new-endpoint

Create POST /api/capture
Body: { chapterId, photo, lat, lng, note? }
Returns: { success, coinsEarned, badgeEarned? }
Auth required: yes
```

### /new-arc
Creates story arc content for the database
```
/new-arc

Create "The Kandy Perahera" arc
World: ROOTS (culture)
Province: CENTRAL
Seasonal: July-August
Chapters: Temple of the Tooth, Elephant procession, Fire dancers
```

### /db-change
Makes safe database schema changes
```
/db-change

Add a 'seasonStart' column to the arcs table
Type: integer (1-12 for month)
Nullable: yes
```

### /debug
Systematic debugging workflow
```
/debug

The map pins aren't showing.
Expected: 5 pins on the island map
Actual: Empty map, no errors in console
Changed: Updated the arcs API endpoint
```

### /test-milestone
Verify a milestone before moving on
```
/test-milestone

Testing Milestone 8: Capture Moment Flow
- Camera opens: ✓
- Photo captures: ✓  
- API returns coins: ✗ (getting 500 error)
```

---

## Feature 3: Plan Mode

**What it does:** Designs the solution BEFORE writing code. Prevents building the wrong thing.

**When to use:**
- Complex features with multiple files
- Architectural decisions
- When you're not sure how to approach something

**How to invoke:**
```
"Before we code this, let's plan it out.

I need to build the Capture Moment feature.
It should:
1. Open camera fullscreen
2. Capture GPS silently
3. Take photo on tap
4. Upload to API
5. Show celebration animation

Design the data flow, files needed, and API contract first.
Don't write any code yet."
```

**What Claude Code will do:**
1. Map out the architecture
2. List files to create
3. Define interfaces/types
4. Identify potential issues
5. Wait for your approval before coding

---

## Feature 4: Memory System

**What it does:** Remembers project-specific information across sessions.

**How to use:**

**Save to memory:**
```
"Remember this about our project:
- We use Drizzle ORM, not Prisma
- All colors come from theme/colors.ts
- API responses use { success: boolean, data?: T, error?: string }
- Bun runtime, not Node.js"
```

**Recall from memory:**
```
"What did we decide about the API response format?"
```

**Update memory:**
```
"Update the memory: we've decided to use Supabase instead of self-hosted PostgreSQL"
```

---

## Feature 5: Web Search

**What it does:** Searches the web for current documentation, solutions, and examples.

**When to use:**
- Finding latest API changes
- Troubleshooting errors
- Checking best practices
- Finding library documentation

**Examples:**
```
"Search for Expo SDK 52 breaking changes"

"Search for react-native-skia stamp animation examples"

"Search for Hono framework authentication middleware"

"Search for Drizzle ORM PostGIS setup"
```

---

## Feature 6: File Reading & Understanding

**What it does:** Reads and understands existing code before making changes.

**How to use:**
```
"Read the capture service and explain what it does"

"Read all files in apps/mobile/src/theme/ and summarize the design system"

"Before changing the auth flow, read the current implementation"
```

**Best practice:** ALWAYS ask Claude Code to read existing code before modifying it.

---

## Feature 7: Multi-File Editing

**What it does:** Makes coordinated changes across multiple files.

**When to use:**
- Refactoring
- Adding a feature that touches many files
- Updating imports/exports
- Changing shared types

**Example:**
```
"Add the tasteXP field to:
1. The user schema in api/src/db/schema/users.ts
2. The User type in packages/shared/types.ts
3. The profile screen in apps/mobile/src/app/(tabs)/passport.tsx
4. The capture service that awards XP

Make sure all imports are updated."
```

---

## Feature 8: Git Integration

**What it does:** Manages version control directly.

**Commands:**
```
"Commit everything with message: feat: capture moment flow complete"

"Show me the git diff for the last changes"

"Create a new branch called feature/marketplace"

"What files have I changed since the last commit?"
```

**Best practice:** Commit after every working milestone, not at the end of a session.

---

## Feature 9: GitHub Integration

**What it does:** Creates PRs, manages issues, checks CI status.

**Commands:**
```
"Create a PR for the capture feature branch"

"Check if the CI build passed"

"Show me open issues"

"Add a comment to PR #12"
```

---

## Feature 10: MCP Servers (Connectors)

**What it does:** Connects to external services for additional capabilities.

**Available connectors:**
- File system access
- Database connections
- API integrations
- Cloud service connections

**How to use:**
Check what's available, then use naturally:
```
"Connect to the Supabase database and show me the tables"

"Check the Cloudflare R2 bucket for uploaded images"
```

---

## Session Workflow Cheatsheet

### Starting a Session
```
1. Claude reads CLAUDE.md automatically
2. Check "Current Phase" and "Current Session Memory"
3. State your goal: "Today I want to complete Milestone 8: Capture Moment"
4. Start building
```

### During a Session
```
1. Use /commands for repeatable tasks
2. Use Plan Mode for complex features
3. Commit after each working piece
4. If something breaks, use /debug
5. Ask Claude to explain anything unclear
```

### Ending a Session
```
1. "Update CLAUDE.md with what we accomplished"
2. "Commit everything"
3. "What should I work on next session?"
4. Note the answer for yourself
```

---

## Common Patterns

### Pattern: "Read Before Write"
Always have Claude read existing code before changing it:
```
"Before we add the badge system, read:
- The capture service
- The user schema  
- The gamification types

Then show me how badges should integrate."
```

### Pattern: "Explain Then Approve"
For complex changes, get an explanation first:
```
"Explain what changes you're about to make to the auth flow.
Don't make them yet — just explain."
```

### Pattern: "Test Then Commit"
After each feature:
```
"I've tested this and it works. Commit with message: feat: add passport stamp animation"
```

### Pattern: "Memory Checkpoint"
At key decision points:
```
"Remember this decision: We're using Ably for realtime instead of Socket.io because of the managed infrastructure."
```

---

## Troubleshooting

### "Claude forgot what we were building"
→ Check CLAUDE.md is present and up to date
→ Say "Read CLAUDE.md and remind yourself about our project"

### "The code doesn't follow our conventions"
→ Add conventions to CLAUDE.md
→ Create a /command that enforces the pattern

### "Claude keeps suggesting libraries we don't use"
→ Add to Memory: "We use X, not Y"
→ Add to CLAUDE.md tech stack section

### "Changes broke something elsewhere"
→ Use /debug with full context
→ Ask Claude to "check if this change affects other files"

### "Session is getting slow/confused"
→ Ask Claude to "summarize what we've done"
→ Update CLAUDE.md
→ Start fresh session with clean context
