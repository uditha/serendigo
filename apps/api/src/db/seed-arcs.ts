import { db } from './index'
import { arcs } from './schema/arcs'
import { chapters } from './schema/chapters'

const ARC_DATA = [
  {
    id: 'arc_colombo_street_food',
    title: 'The Colombo Street Food Circuit',
    slug: 'colombo-street-food-circuit',
    worldType: 'TASTE' as const,
    province: 'WESTERN' as const,
    narratorName: 'Nimal',
    introText: "Colombo doesn't do food quietly. From the kottu carts banging iron at midnight to the hoppers sizzling at dawn, the city is always cooking. Follow Nimal through the streets he grew up on.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'Hoppers at Dawn',
        loreText: 'The hopper — bowl-shaped, crispy at the edges, soft in the centre — has been Sri Lanka\'s breakfast for centuries. The word "hopper" is a British corruption of "appa", the Tamil name. The best ones are eaten standing up, from a roadside cart, before the city wakes.',
        lat: 6.9271,
        lng: 79.8612,
        radiusMeters: 300,
        coinReward: 50,
        xpCategory: 'TASTE' as const,
        beforeYouGo: {
          bestTime: 'Before 8am — hoppers sell out fast',
          dresscode: 'Casual',
          entryFee: 'Around 50 LKR per hopper',
          etiquette: 'Point at what you want, eat standing or perched nearby',
        },
      },
      {
        order: 2,
        title: 'The Kottu Rhythm',
        loreText: "The sound of kottu being made — the rhythmic clang of two metal blades chopping roti against a hot griddle — is the sound of a Sri Lankan city at night. It's percussive, hypnotic, and it means someone nearby is making the best fast food on the island.",
        lat: 6.9175,
        lng: 79.8584,
        radiusMeters: 250,
        coinReward: 60,
        xpCategory: 'TASTE' as const,
        beforeYouGo: {
          bestTime: 'After 9pm when the carts really get going',
          dresscode: 'Anything',
          entryFee: '200–350 LKR',
          etiquette: 'Order by type (chicken, cheese, egg) and spice level',
        },
      },
      {
        order: 3,
        title: 'A Cup of Real Ceylon Tea',
        loreText: "Ceylon tea — the world drinks it every day without knowing. Sri Lanka produces some of the finest single-estate teas on earth, but most locals drink a strong milky version called 'plain tea'. At the right tea shop, a single cup costs less than a dollar and tastes better than anything in a tin.",
        lat: 6.9344,
        lng: 79.8428,
        radiusMeters: 200,
        coinReward: 40,
        xpCategory: 'TASTE' as const,
        beforeYouGo: {
          bestTime: 'Mid-morning or late afternoon',
          dresscode: 'Casual',
          entryFee: '30–80 LKR',
          etiquette: 'Ask for "plain tea" for the local style, or "tea with milk" for the tourist version',
        },
      },
    ],
  },
  {
    id: 'arc_ancient_kingdoms',
    title: 'The Ancient Kingdom Route',
    slug: 'ancient-kingdom-route',
    worldType: 'ROOTS' as const,
    province: 'NORTH_CENTRAL' as const,
    narratorName: 'Priya',
    introText: "These cities predate Rome. Anuradhapura was a thriving metropolis when Britain was fields and mud. Priya grew up near the ruins and has spent her life learning their stories. This is not a museum tour — it's a walk through 2,500 years of living civilization.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'Anuradhapura by Bicycle',
        loreText: "The sacred city of Anuradhapura was the capital of Sri Lanka for over 1,300 years. Its dagobas — white dome-shaped shrines — are among the largest ancient structures in the world. The biggest, Jetavanaramaya, was once the third tallest structure on earth. A bicycle is the only way to feel the scale of it properly.",
        lat: 8.3114,
        lng: 80.4037,
        radiusMeters: 500,
        coinReward: 75,
        xpCategory: 'ROOTS' as const,
        beforeYouGo: {
          bestTime: 'Before 9am or after 4pm to avoid the heat',
          dresscode: 'Cover shoulders and knees — this is a sacred site',
          entryFee: 'USD 25 for the Cultural Triangle ticket',
          etiquette: 'Remove shoes at all shrines. Walk clockwise around dagobas.',
        },
      },
      {
        order: 2,
        title: 'Climb Sigiriya at Sunrise',
        loreText: "King Kashyapa built his palace on top of a 200-metre rock in the 5th century AD, surrounded by gardens that used to have hydraulic fountains. He ruled from here for 18 years. Then his brother came back with an army. The frescoes of the celestial maidens painted into the rock face — the \"cloud maidens\" — are the most visited sight in Sri Lanka.",
        lat: 7.9570,
        lng: 80.7603,
        radiusMeters: 400,
        coinReward: 100,
        xpCategory: 'ROOTS' as const,
        beforeYouGo: {
          bestTime: 'Gates open at 7am — arrive at 6:30 to queue',
          dresscode: 'Comfortable shoes — 1,200 steps',
          entryFee: 'USD 30',
          etiquette: 'No touching the frescoes. Photography allowed except in the fresco gallery.',
        },
      },
    ],
  },
]

async function seedArcs() {
  console.log('Seeding arcs and chapters...')

  for (const arcData of ARC_DATA) {
    const { chapters: chapterData, ...arcFields } = arcData

    await db.insert(arcs).values(arcFields).onConflictDoUpdate({
      target: arcs.id,
      set: {
        title: arcFields.title,
        isPublished: arcFields.isPublished,
      },
    })

    for (const chapter of chapterData) {
      const chapterId = `${arcData.id}_ch${chapter.order}`
      await db.insert(chapters).values({
        id: chapterId,
        arcId: arcData.id,
        ...chapter,
      }).onConflictDoUpdate({
        target: chapters.id,
        set: { title: chapter.title },
      })
    }

    console.log(`✓ ${arcData.title} (${chapterData.length} chapters)`)
  }

  console.log('Done seeding arcs.')
  process.exit(0)
}

seedArcs().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
