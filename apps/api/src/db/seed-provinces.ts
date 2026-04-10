import { db } from './index'
import { provinces } from './schema/provinces'

const PROVINCES = [
  { id: 'western',       name: 'Western',       slug: 'western',       stampDesignKey: null, fillColor: '#E8832A' },
  { id: 'central',       name: 'Central',       slug: 'central',       stampDesignKey: null, fillColor: '#1A6B7A' },
  { id: 'southern',      name: 'Southern',      slug: 'southern',      stampDesignKey: null, fillColor: '#27AE60' },
  { id: 'northern',      name: 'Northern',      slug: 'northern',      stampDesignKey: null, fillColor: '#8E44AD' },
  { id: 'eastern',       name: 'Eastern',       slug: 'eastern',       stampDesignKey: null, fillColor: '#2980B9' },
  { id: 'north-western', name: 'North Western', slug: 'north-western', stampDesignKey: null, fillColor: '#E67E22' },
  { id: 'north-central', name: 'North Central', slug: 'north-central', stampDesignKey: null, fillColor: '#F39C12' },
  { id: 'uva',           name: 'Uva',           slug: 'uva',           stampDesignKey: null, fillColor: '#27AE60' },
  { id: 'sabaragamuwa',  name: 'Sabaragamuwa',  slug: 'sabaragamuwa',  stampDesignKey: null, fillColor: '#E74C3C' },
]

async function seed() {
  console.log('Seeding provinces...')

  await db
    .insert(provinces)
    .values(PROVINCES)
    .onConflictDoUpdate({
      target: provinces.id,
      set: { name: provinces.name, slug: provinces.slug },
    })

  console.log(`✓ ${PROVINCES.length} provinces seeded`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
