# /new-arc

Add a new story arc with chapters to the SerendiGO database.

## Arc Structure

An arc is a curated journey through Sri Lanka with 3-7 chapters (locations to visit).

```typescript
interface Arc {
  title: string;           // "The Colombo Street Food Circuit"
  slug: string;            // "colombo-street-food"
  worldType: WorldType;    // TASTE | WILD | MOVE | ROOTS | RESTORE
  province: Province;      // WESTERN | CENTRAL | SOUTHERN | etc.
  narratorName: string;    // "Lakshmi, street food vendor for 30 years"
  introText: string;       // The narrator's opening story (2-3 paragraphs)
  seasonStart?: number;    // Month 1-12 (null if year-round)
  seasonEnd?: number;      // Month 1-12
  difficulty: Difficulty;  // EASY | MODERATE | CHALLENGING
  coverImageUrl: string;
  chapters: Chapter[];
}

interface Chapter {
  order: number;           // 1, 2, 3...
  title: string;           // "Galle Face Green at Sunset"
  loreText: string;        // Revealed after capture (the reward)
  beforeYouGo: {
    dressCode?: string;    // "Casual, but remove shoes at temple"
    bestTime?: string;     // "6-7pm for sunset + street vendors"
    entryFee?: string;     // "Free" or "LKR 3,000 foreigners"
    etiquette?: string;    // "Eating with right hand is traditional"
  };
  lat: number;             // GPS latitude
  lng: number;             // GPS longitude
  radiusMeters: number;    // How close to capture (usually 200)
  coinReward: number;      // 30-100 depending on difficulty
  xpCategory: XPCategory;  // Same as worldType usually
}
```

## World Types (5 Experience Worlds)

| World | Color | Icon | Content Focus |
|-------|-------|------|---------------|
| TASTE | #E67E22 | 🍴 | Food, cooking, markets, tea |
| WILD | #27AE60 | 🐾 | Wildlife, safaris, nature |
| MOVE | #2980B9 | 🌊 | Surfing, trekking, trains |
| ROOTS | #8E44AD | 🏛 | Temples, history, crafts |
| RESTORE | #F39C12 | 🌿 | Wellness, meditation, yoga |

## Provinces (9)
WESTERN, CENTRAL, SOUTHERN, NORTHERN, EASTERN, 
NORTH_WESTERN, NORTH_CENTRAL, UVA, SABARAGAMUWA

## Seasonal Arcs
If the arc is seasonal, set `seasonStart` and `seasonEnd`:
- Whale watching Mirissa: seasonStart: 11, seasonEnd: 4 (Nov-Apr)
- Surfing Arugam Bay: seasonStart: 5, seasonEnd: 10 (May-Oct)
- Elephant Gathering: seasonStart: 8, seasonEnd: 10 (Aug-Oct)

## Output Format

Generate Drizzle seed statements:

```typescript
// seeds/arcs/colombo-street-food.ts
import { db } from '../../db';
import { arcs, chapters } from '../../db/schema';

export async function seedColomboStreetFood() {
  const [arc] = await db.insert(arcs).values({
    title: 'The Colombo Street Food Circuit',
    slug: 'colombo-street-food',
    worldType: 'TASTE',
    province: 'WESTERN',
    // ... rest of arc data
  }).returning();

  await db.insert(chapters).values([
    {
      arcId: arc.id,
      order: 1,
      title: 'Galle Face Green at Sunset',
      // ... chapter data
    },
    // ... more chapters
  ]);
}
```

## Ask me:
1. What is the arc name/theme?
2. Which World type? (TASTE/WILD/MOVE/ROOTS/RESTORE)
3. Which Province?
4. Is it seasonal? If yes, which months?
5. Who is the narrator? (local person perspective)
6. What are the 3-7 chapter locations? (name + GPS coordinates)
