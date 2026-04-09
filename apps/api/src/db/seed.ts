import { db } from './index'
import { districts } from './schema/districts'

const DISTRICTS = [
  // Western Province
  { id: 'colombo',     name: 'Colombo',     slug: 'colombo',     province: 'western' },
  { id: 'gampaha',     name: 'Gampaha',     slug: 'gampaha',     province: 'western' },
  { id: 'kalutara',    name: 'Kalutara',    slug: 'kalutara',    province: 'western' },
  // Central Province
  { id: 'kandy',       name: 'Kandy',       slug: 'kandy',       province: 'central' },
  { id: 'matale',      name: 'Matale',      slug: 'matale',      province: 'central' },
  { id: 'nuwara-eliya',name: 'Nuwara Eliya',slug: 'nuwara-eliya',province: 'central' },
  // Southern Province
  { id: 'galle',       name: 'Galle',       slug: 'galle',       province: 'southern' },
  { id: 'matara',      name: 'Matara',      slug: 'matara',      province: 'southern' },
  { id: 'hambantota',  name: 'Hambantota',  slug: 'hambantota',  province: 'southern' },
  // Northern Province
  { id: 'jaffna',      name: 'Jaffna',      slug: 'jaffna',      province: 'northern' },
  { id: 'kilinochchi', name: 'Kilinochchi', slug: 'kilinochchi', province: 'northern' },
  { id: 'mannar',      name: 'Mannar',      slug: 'mannar',      province: 'northern' },
  { id: 'vavuniya',    name: 'Vavuniya',    slug: 'vavuniya',    province: 'northern' },
  { id: 'mullaitivu',  name: 'Mullaitivu',  slug: 'mullaitivu',  province: 'northern' },
  // Eastern Province
  { id: 'batticaloa',  name: 'Batticaloa',  slug: 'batticaloa',  province: 'eastern' },
  { id: 'ampara',      name: 'Ampara',      slug: 'ampara',      province: 'eastern' },
  { id: 'trincomalee', name: 'Trincomalee', slug: 'trincomalee', province: 'eastern' },
  // North Western Province
  { id: 'kurunegala',  name: 'Kurunegala',  slug: 'kurunegala',  province: 'north_western' },
  { id: 'puttalam',    name: 'Puttalam',    slug: 'puttalam',    province: 'north_western' },
  // North Central Province
  { id: 'anuradhapura',name: 'Anuradhapura',slug: 'anuradhapura',province: 'north_central' },
  { id: 'polonnaruwa', name: 'Polonnaruwa', slug: 'polonnaruwa', province: 'north_central' },
  // Uva Province
  { id: 'badulla',     name: 'Badulla',     slug: 'badulla',     province: 'uva' },
  { id: 'moneragala',  name: 'Moneragala',  slug: 'moneragala',  province: 'uva' },
  // Sabaragamuwa Province
  { id: 'ratnapura',   name: 'Ratnapura',   slug: 'ratnapura',   province: 'sabaragamuwa' },
  { id: 'kegalle',     name: 'Kegalle',     slug: 'kegalle',     province: 'sabaragamuwa' },
]

async function seed() {
  console.log('Seeding districts...')

  await db
    .insert(districts)
    .values(DISTRICTS)
    .onConflictDoUpdate({
      target: districts.id,
      set: { name: districts.name, slug: districts.slug, province: districts.province },
    })

  console.log(`✓ ${DISTRICTS.length} districts seeded`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
