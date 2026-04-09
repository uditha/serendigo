---
name: serendigo-content
description: Create story arc content for SerendiGO. Use this skill when adding new arcs, chapters, or travel content for Sri Lanka. Triggers for creating food tours, wildlife experiences, adventure routes, cultural journeys, or wellness retreats. Also use when the user mentions Sri Lanka destinations, provinces, attractions, or wants to add travel content.
---

# SerendiGO Content Creation Skill

## What is a Story Arc?

A story arc is a curated journey through Sri Lanka told by a local narrator. It has 3-7 chapters, each representing a location to visit and capture.

**Arc = Story + Locations + Rewards**

## The Five Experience Worlds

Every arc belongs to one of five worlds:

| World | Code | Color | Focus | Example Arcs |
|-------|------|-------|-------|--------------|
| **Taste** | TASTE | #E67E22 | Food, cooking, markets | Street food circuits, cooking classes, tea tasting |
| **Wild** | WILD | #27AE60 | Wildlife, nature | Safari arcs, whale watching, bird watching |
| **Move** | MOVE | #2980B9 | Adventure, physical | Surfing, trekking, train journeys, cycling |
| **Roots** | ROOTS | #8E44AD | Culture, history | Temple trails, ancient cities, craft workshops |
| **Restore** | RESTORE | #F39C12 | Wellness, calm | Ayurveda journeys, meditation retreats, slow travel |

## The Nine Provinces

```
NORTHERN      - Jaffna, Palmyra palms, Hindu kovils
NORTH_CENTRAL - Anuradhapura, Sigiriya, ancient cities
NORTH_WESTERN - Wilpattu, fishing villages
CENTRAL       - Kandy, tea country, Knuckles Range
EASTERN       - Trincomalee, Arugam Bay, beaches
WESTERN       - Colombo, Negombo, urban life
SABARAGAMUWA  - Ratnapura gems, rainforest
UVA           - Ella, Nine Arch Bridge, tea estates
SOUTHERN      - Galle, Mirissa, coastal beauty
```

## Arc Structure

```typescript
interface Arc {
  // Identity
  title: string;           // "The Colombo Street Food Circuit"
  slug: string;            // "colombo-street-food" (auto-generated)
  
  // Classification
  worldType: WorldType;    // TASTE | WILD | MOVE | ROOTS | RESTORE
  province: Province;      // WESTERN | CENTRAL | etc.
  
  // Narrator (the local voice)
  narratorName: string;    // "Lakshmi, street food vendor for 30 years"
  narratorBio: string;     // 2-3 sentences about who they are
  
  // Story
  introText: string;       // Opening story (2-3 paragraphs, first person)
  hiddenGem: {             // Revealed only after completing the arc
    title: string;
    description: string;
    lat: number;
    lng: number;
  };
  
  // Metadata
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING';
  minDays: number;         // Recommended minimum days to complete
  coverImageUrl: string;   // Hero image for the arc
  
  // Seasonal (optional)
  isSeasonal: boolean;
  seasonStart?: number;    // Month 1-12
  seasonEnd?: number;      // Month 1-12
  
  // Chapters
  chapters: Chapter[];     // 3-7 locations
}
```

## Chapter Structure

```typescript
interface Chapter {
  // Identity
  order: number;           // 1, 2, 3...
  title: string;           // "Galle Face Green at Sunset"
  
  // Content
  loreText: string;        // Revealed AFTER capture (the reward!)
  beforeYouGo: {
    dressCode?: string;    // "Remove shoes, cover shoulders at temples"
    bestTime?: string;     // "6-7pm for golden hour and street vendors"
    entryFee?: string;     // "Free" or "LKR 3,000 (foreigners)"
    etiquette?: string;    // "Eating with right hand is traditional"
    tips?: string;         // "Bring mosquito repellent"
  };
  
  // Location
  lat: number;             // GPS latitude (decimal degrees)
  lng: number;             // GPS longitude (decimal degrees)
  radiusMeters: number;    // How close to capture (default 200m)
  
  // Rewards
  coinReward: number;      // 30-100 based on effort
  xpCategory: XPCategory;  // Usually same as arc's worldType
}
```

## Coin Reward Guidelines

| Effort Level | Coins | Examples |
|--------------|-------|----------|
| **Easy** (30-40) | Walk-up location, no preparation needed | Street food stall, viewpoint |
| **Moderate** (50-60) | Some planning or timing required | Temple visit at puja time, market at dawn |
| **Challenging** (70-100) | Physical effort, remote, or special timing | Summit hike, night safari, boat trip |

## Seasonal Content

Sri Lanka has two monsoons — plan arcs accordingly:

```
SOUTH-WEST MONSOON (May-September):
- West coast and hill country = WET
- East coast = PERFECT
- Best for: Arugam Bay surfing, Trinco diving, Yala (early season)

NORTH-EAST MONSOON (November-February):
- East coast = WET  
- West and south coast = PERFECT
- Best for: Mirissa whales, Weligama surfing, Galle Fort

YEAR-ROUND:
- Kandy, Colombo, Cultural Triangle (hot but manageable)
- Hill country (can be wet but always beautiful)
```

### Seasonal Arc Examples

```typescript
// Whale Watching - Mirissa
{
  isSeasonal: true,
  seasonStart: 11,  // November
  seasonEnd: 4,     // April
}

// Surfing - Arugam Bay
{
  isSeasonal: true,
  seasonStart: 5,   // May
  seasonEnd: 10,    // October
}

// Elephant Gathering - Minneriya
{
  isSeasonal: true,
  seasonStart: 8,   // August
  seasonEnd: 10,    // October
}
```

## Writing Guidelines

### Narrator Voice
- First person ("I've been selling hoppers here for...")
- Personal, warm, knowledgeable
- Local perspective, not tourist guide
- Stories over facts

### Intro Text (2-3 paragraphs)
```
Good intro:
"I've watched this city wake up from behind my hopper pan for thirty 
years. Before the office workers arrive, before the tourists stir, 
Colombo belongs to the early risers — the fishermen unloading at 
Pettah, the temple bells calling the devout, the street vendors 
setting up their carts.

This is the city I want to show you. Not the traffic, not the malls. 
The Colombo that feeds itself, that prays together, that hasn't 
changed since my grandmother taught me this recipe."

Bad intro:
"Colombo is the capital of Sri Lanka with a population of 752,993. 
It offers many tourist attractions including temples, markets, 
and restaurants. This tour will take you to five popular locations."
```

### Lore Text (revealed after capture)
- Reward for visiting — make it feel special
- Stories, secrets, local knowledge
- Things you can't read on Wikipedia
- Connect to the moment they just experienced

```
Good lore:
"You've just eaten at the spot where my father proposed to my mother 
in 1967. He bought her isso vadi — the same shrimp fritters you 
just tasted — and asked her to marry him right here on this sea wall. 
She said yes, but only after he bought her a second helping."

Bad lore:
"This is Galle Face Green, a popular oceanfront promenade. 
It was created in 1859 by the British governor."
```

### Before You Go
- Practical, specific, helpful
- Save them from common mistakes
- Local knowledge, not guidebook facts

```
Good:
bestTime: "4:30-6pm — vendors arrive around 4, sunset at 6:15"
etiquette: "Point at what you want, then pay. Don't haggle — prices are fair"

Bad:
bestTime: "Evening"
etiquette: "Be respectful"
```

## Example Arc: Complete

```typescript
{
  title: "The Colombo Street Food Circuit",
  slug: "colombo-street-food",
  worldType: "TASTE",
  province: "WESTERN",
  
  narratorName: "Lakshmi Fernando",
  narratorBio: "I've been selling hoppers at Galle Face for 35 years. My mother taught me, her mother taught her. I've seen this city change, but the food — the real food — stays the same.",
  
  introText: `I've watched this city wake up from behind my hopper pan for thirty years. Before the office workers arrive, before the tourists stir, Colombo belongs to the early risers — the fishermen unloading at Pettah, the temple bells calling the devout, the street vendors setting up their carts.

This is the city I want to show you. Not the traffic, not the malls. The Colombo that feeds itself, that prays together, that hasn't changed since my grandmother taught me this recipe.

Follow me from dawn to dusk. I'll show you where we eat.`,
  
  hiddenGem: {
    title: "Lakshmi's Secret Hopper",
    description: "My friend Soma makes the best egg hoppers in the city, but she doesn't have a sign. Look for the blue door next to the tailor. Tell her I sent you.",
    lat: 6.9147,
    lng: 79.8536,
  },
  
  difficulty: "EASY",
  minDays: 1,
  coverImageUrl: "https://images.serendigo.app/arcs/colombo-street-food.jpg",
  isSeasonal: false,
  
  chapters: [
    {
      order: 1,
      title: "Pettah at Dawn",
      loreText: "The kottu here has been made by the same family for three generations. Listen to the rhythm — that's Abdul, his father, and his son all working the same blade. They learned the beat before they learned to walk.",
      beforeYouGo: {
        bestTime: "6:00-7:30am — market fully alive, not yet crowded",
        dressCode: "Comfortable shoes, this is a walking market",
        etiquette: "Don't block the aisles — traders move fast",
        tips: "Bring small notes, vendors rarely have change for big bills",
      },
      lat: 6.9389,
      lng: 79.8515,
      radiusMeters: 300,
      coinReward: 50,
      xpCategory: "TASTE",
    },
    {
      order: 2,
      title: "String Hoppers at Majestic City",
      loreText: "The woman who runs this stall — we call her Amma, 'mother' — feeds half the office workers in Bambalapitiya. She starts cooking at 4am so the hoppers are fresh when the first buses arrive.",
      beforeYouGo: {
        bestTime: "7:00-9:00am for breakfast crowd",
        entryFee: "Free (mall food court)",
        etiquette: "Order at counter, they'll bring it to you",
      },
      lat: 6.8887,
      lng: 79.8558,
      radiusMeters: 100,
      coinReward: 40,
      xpCategory: "TASTE",
    },
    {
      order: 3,
      title: "Galle Face Green at Sunset",
      loreText: "You've just eaten at the spot where my father proposed to my mother in 1967. He bought her isso vadi — the same shrimp fritters you just tasted — and asked her to marry him right here on this sea wall. She said yes, but only after he bought her a second helping.",
      beforeYouGo: {
        bestTime: "5:00-7:00pm for sunset and full vendor crowd",
        etiquette: "Point at what you want — vendors are used to non-Sinhala speakers",
        tips: "Bring tissues, some snacks are messy. Try the isso vadi and the corn.",
      },
      lat: 6.9271,
      lng: 79.8428,
      radiusMeters: 200,
      coinReward: 60,
      xpCategory: "TASTE",
    },
  ],
}
```

## GPS Coordinates Quick Reference

### Major Cities
```
Colombo Fort:        6.9344, 79.8428
Kandy Temple:        7.2936, 80.6413
Galle Fort:          6.0328, 80.2170
Jaffna Town:         9.6615, 80.0255
Trincomalee:         8.5874, 81.2152
Anuradhapura:        8.3114, 80.4037
Sigiriya:            7.9570, 80.7603
Ella Town:           6.8667, 81.0466
Arugam Bay:          6.8406, 81.8364
Mirissa Beach:       5.9483, 80.4567
Negombo Beach:       7.2094, 79.8383
Nuwara Eliya:        6.9497, 80.7891
Polonnaruwa:         7.9403, 81.0188
Dambulla:            7.8675, 80.6517
```

### Key Landmarks
```
Temple of the Tooth:    7.2936, 80.6413
Sigiriya Rock:          7.9570, 80.7603
Nine Arch Bridge:       6.8789, 81.0594
Adam's Peak:            6.8096, 80.4994
Yala Entrance:          6.3695, 81.5166
Minneriya Tank:         8.0343, 80.8949
Horton Plains:          6.8018, 80.8004
Sinharaja Entrance:     6.4250, 80.4600
```

## Output Format

When creating an arc, output as a Drizzle seed file:

```typescript
// seeds/arcs/colombo-street-food.ts
import { db } from '../../src/db';
import { arcs, chapters } from '../../src/db/schema';
import { createId } from '@paralleldrive/cuid2';

export async function seed() {
  const arcId = createId();
  
  await db.insert(arcs).values({
    id: arcId,
    title: 'The Colombo Street Food Circuit',
    slug: 'colombo-street-food',
    worldType: 'TASTE',
    province: 'WESTERN',
    narratorName: 'Lakshmi Fernando',
    introText: '...',
    // ... rest of arc
  });
  
  await db.insert(chapters).values([
    {
      id: createId(),
      arcId,
      order: 1,
      title: 'Pettah at Dawn',
      // ... rest of chapter
    },
    // ... more chapters
  ]);
  
  console.log('✓ Seeded: The Colombo Street Food Circuit');
}
```

## Checklist for New Arcs

Before submitting an arc, verify:

- [ ] Title is evocative, not generic
- [ ] Narrator has a name, personality, and reason to tell this story
- [ ] Intro text is 2-3 paragraphs in first person
- [ ] 3-7 chapters, each with unique value
- [ ] GPS coordinates are accurate (verify on Google Maps)
- [ ] Radius makes sense for each location (200m default)
- [ ] Coin rewards match effort level
- [ ] Lore texts are rewards, not Wikipedia facts
- [ ] Before You Go info is practical and specific
- [ ] Seasonal flags set correctly if applicable
- [ ] Hidden gem is genuinely special
- [ ] All text in English, local terms explained
