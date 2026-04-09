# /debug

Systematically debug an issue in the SerendiGO codebase.

## ⚠️ DON'T GUESS — INVESTIGATE

Before changing ANY code:
1. Understand the expected behavior
2. Understand the actual behavior
3. Read the relevant files
4. Form a hypothesis
5. Verify the hypothesis
6. Only then: fix

## Debug Process

### Step 1: Gather Information

Tell me:
```
EXPECTED: What should happen?
ACTUAL: What happens instead?
STEPS: How do I reproduce this?
CHANGED: What did you change before it broke?
ERROR: Any error messages? (exact text)
```

### Step 2: Read the Code Path

I will read files in order of the data flow:
- Mobile: Component → Hook → Service → API call
- API: Route → Handler → Service → Database

### Step 3: Add Diagnostic Logging

```typescript
// Mobile (temporary)
console.log('[DEBUG] ArcCard:', { arcId, data });

// API (temporary)
console.log('[DEBUG] getArcs service:', { filters, result });
```

### Step 4: Check Common Issues

**Mobile Issues:**
- [ ] TanStack Query cache stale?
- [ ] Navigation params missing?
- [ ] Async state not handled?
- [ ] Theme values hardcoded instead of imported?

**API Issues:**
- [ ] Database connection?
- [ ] Environment variables missing?
- [ ] Drizzle query wrong?
- [ ] Auth middleware blocking?

**Both:**
- [ ] TypeScript type mismatch?
- [ ] Import path wrong?
- [ ] Null/undefined not handled?

### Step 5: Fix and Verify

After fixing:
1. Remove diagnostic logging
2. Test the original scenario
3. Test related scenarios (didn't break anything else?)

## Common Error Patterns

### "Cannot read property X of undefined"
```typescript
// Problem
const title = arc.title; // arc is undefined

// Fix: Check first
const title = arc?.title ?? 'Unknown';
```

### "Network request failed"
```typescript
// Check 1: Is API running?
curl http://localhost:3000/health

// Check 2: Is URL correct?
console.log('Fetching:', url);

// Check 3: Is auth token present?
console.log('Token:', token);
```

### "Drizzle query returns empty"
```typescript
// Check the SQL being generated
import { sql } from 'drizzle-orm';
console.log(query.toSQL());
```

### "Expo build fails"
```bash
# Clear cache and rebuild
npx expo start --clear
```

## Ask me:
1. What's broken? (be specific)
2. What was the last thing that worked?
3. What changed between "working" and "broken"?
