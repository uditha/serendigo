# /new-endpoint

Add a new API endpoint to the Hono backend following our conventions.

## Instructions

1. **Check existing patterns**: Look at `apps/api/src/routes/` for examples
2. **Follow the layered architecture**:
   - Route → defines the HTTP path
   - Handler → validates input, calls service, returns response
   - Service → all business logic lives here

## File Locations
```
apps/api/src/
├── routes/[domain].ts       # Route definitions
├── handlers/[domain].ts     # Request handlers
├── services/[domain].ts     # Business logic
└── db/schema/[domain].ts    # Drizzle schema (if new table)
```

## Route Template
```typescript
// routes/arcs.ts
import { Hono } from 'hono';
import { getArcs, getArcById } from '../handlers/arcs';
import { authMiddleware } from '../middleware/auth';

const arcs = new Hono();

arcs.get('/', getArcs);
arcs.get('/:id', getArcById);
arcs.post('/:id/enroll', authMiddleware, enrollInArc);

export default arcs;
```

## Handler Template
```typescript
// handlers/arcs.ts
import { Context } from 'hono';
import * as arcService from '../services/arcs';

export async function getArcs(c: Context) {
  try {
    const { province, worldType } = c.req.query();
    const arcs = await arcService.getArcs({ province, worldType });
    return c.json({ success: true, data: arcs });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
}
```

## Service Template
```typescript
// services/arcs.ts
import { db } from '../db';
import { arcs, chapters } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function getArcs(filters: ArcFilters) {
  // All business logic here
  // All database queries here
  return await db.select().from(arcs).where(...);
}
```

## Response Format
```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: "Error message" }

// Paginated
{ success: true, data: [...], pagination: { page, limit, total } }
```

## Checklist
- [ ] Route registered in main app (src/index.ts)
- [ ] Handler only does: validate → call service → respond
- [ ] Service contains all business logic
- [ ] Drizzle for database (no raw SQL)
- [ ] Auth middleware on protected routes
- [ ] TypeScript types for request/response

## Ask me:
1. What HTTP method? (GET, POST, PUT, DELETE)
2. What path? (e.g., /api/arcs, /api/capture)
3. What data in request? (body, query params, path params)
4. What data in response?
5. Auth required?
