import { db } from './index'
import { badges } from './schema'

const BADGE_DEFINITIONS = [
  // Capture milestones
  { id: 'first-capture',    name: 'First Step',       description: 'Captured your very first moment',         icon: '📸', conditionType: 'capture_count', conditionValue: '1' },
  { id: 'five-captures',    name: 'Getting Warmed Up', description: 'Captured 5 moments across Sri Lanka',     icon: '🔥', conditionType: 'capture_count', conditionValue: '5' },
  { id: 'ten-captures',     name: 'Explorer',          description: 'Captured 10 moments',                     icon: '🧭', conditionType: 'capture_count', conditionValue: '10' },
  { id: 'twenty-five-captures', name: 'Adventurer',   description: 'Captured 25 moments',                     icon: '⚡', conditionType: 'capture_count', conditionValue: '25' },
  { id: 'fifty-captures',   name: 'Island Veteran',    description: 'Captured 50 moments',                     icon: '🏆', conditionType: 'capture_count', conditionValue: '50' },

  // Arc completion
  { id: 'arc-complete',     name: 'Journey Complete',  description: 'Completed your first full arc',           icon: '🎯', conditionType: 'arc_complete_count', conditionValue: '1' },
  { id: 'three-arcs',       name: 'Storyteller',       description: 'Completed 3 arcs',                        icon: '📖', conditionType: 'arc_complete_count', conditionValue: '3' },

  // World type diversity
  { id: 'all-worlds',       name: 'Renaissance Soul',  description: 'Captured in all 5 world types',           icon: '🌏', conditionType: 'world_diversity', conditionValue: '5' },

  // Province explorer
  { id: 'three-provinces',  name: 'Island Hopper',     description: 'Captured in 3 different provinces',       icon: '🗺️', conditionType: 'province_count', conditionValue: '3' },
  { id: 'nine-provinces',   name: 'The True Serendipian', description: 'Captured in all 9 provinces',          icon: '🇱🇰', conditionType: 'province_count', conditionValue: '9' },
]

async function seedBadges() {
  console.log('Seeding badges...')

  for (const badge of BADGE_DEFINITIONS) {
    await db
      .insert(badges)
      .values(badge)
      .onConflictDoUpdate({
        target: badges.id,
        set: {
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          conditionType: badge.conditionType,
          conditionValue: badge.conditionValue,
        },
      })
  }

  console.log(`✓ Seeded ${BADGE_DEFINITIONS.length} badges`)
  process.exit(0)
}

seedBadges().catch((err) => {
  console.error(err)
  process.exit(1)
})
