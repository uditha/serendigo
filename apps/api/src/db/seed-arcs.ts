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
  // ── WILD ──────────────────────────────────────────────────────────────────
  {
    id: 'arc_yala_leopard',
    title: 'Into Yala: Leopard Country',
    slug: 'yala-leopard-country',
    worldType: 'WILD' as const,
    province: 'SOUTHERN' as const,
    narratorName: 'Roshan',
    introText: "Yala has the highest density of leopards in the world. Most people miss them because they go at the wrong time, look in the wrong places, and make too much noise. Roshan has been tracking these cats for fifteen years. He knows which rock they sleep on.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'Yala Block 1 at Dawn',
        loreText: "Block 1 is the oldest and most visited section of Yala, and for good reason — the leopards here have grown up around jeeps and barely register them. The best sightings happen in the first hour after the gates open at 6am, when the cats are still moving and the light is golden.",
        lat: 6.4167,
        lng: 81.5139,
        radiusMeters: 500,
        coinReward: 80,
        xpCategory: 'WILD' as const,
        beforeYouGo: {
          bestTime: 'Gates open at 6am — be first in line',
          dresscode: 'Muted colours — no white or bright red',
          entryFee: 'USD 15 park entry + jeep hire (~5,000 LKR)',
          etiquette: 'No standing in the jeep. Stay silent near sightings.',
        },
      },
      {
        order: 2,
        title: 'Menik Ganga River Crossing',
        loreText: "The Menik Ganga river cuts through the park boundary and is one of the few permanent water sources in the dry season. Mugger crocodiles line the banks in the afternoon heat, barely moving. Water buffalo wade through looking unbothered. Elephants come to drink at dusk. The river doesn't sleep.",
        lat: 6.3950,
        lng: 81.4800,
        radiusMeters: 400,
        coinReward: 60,
        xpCategory: 'WILD' as const,
        beforeYouGo: {
          bestTime: 'Late afternoon for the best wildlife activity',
          dresscode: 'Muted tones, insect repellent essential',
          entryFee: 'Included in park ticket',
          etiquette: 'Do not approach the riverbank on foot',
        },
      },
      {
        order: 3,
        title: 'Patanangala Beach',
        loreText: "At the southern tip of Yala, the jungle meets the Indian Ocean. Patanangala is a rocky beach where leopards come to sunbathe in the early morning — the combination of warm rock and sea breeze makes it their favourite lounge spot. It is one of the rarest wildlife scenes in Asia: a wild leopard, on a beach, watching the sea.",
        lat: 6.3766,
        lng: 81.5363,
        radiusMeters: 350,
        coinReward: 100,
        xpCategory: 'WILD' as const,
        beforeYouGo: {
          bestTime: '6:30–8:30am for leopard sightings on the rocks',
          dresscode: 'Sun protection — no shade on the beach',
          entryFee: 'Included in park ticket',
          etiquette: 'Jeeps must keep 20m from any big cat',
        },
      },
    ],
  },
  {
    id: 'arc_udawalawe_elephants',
    title: 'Udawalawe: Elephant Country',
    slug: 'udawalawe-elephants',
    worldType: 'WILD' as const,
    province: 'SABARAGAMUWA' as const,
    narratorName: 'Kumari',
    introText: "If Yala is about leopards, Udawalawe is about elephants — and nothing else. The park was created to protect the herds displaced by the reservoir. There are around 700 elephants here. You will see them. Kumari has never left a safari empty-handed.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'The Reservoir at Sunrise',
        loreText: "The Udawalawe reservoir was built in 1968, flooding the valley and displacing both villages and wildlife. The elephants adapted. Now they come to the water's edge every morning in herds of twenty or thirty, young calves stumbling on the muddy banks while the matriarchs drink in silence. It is one of the great elephant spectacles on earth.",
        lat: 6.4833,
        lng: 80.9000,
        radiusMeters: 500,
        coinReward: 75,
        xpCategory: 'WILD' as const,
        beforeYouGo: {
          bestTime: '6–9am for herds at the water',
          dresscode: 'Neutral colours, hat, sunscreen',
          entryFee: 'USD 15 park entry + 4WD hire',
          etiquette: 'Never between a mother and her calf',
        },
      },
      {
        order: 2,
        title: 'Elephant Transit Home',
        loreText: "The Elephant Transit Home at Udawalawe is the only facility in Sri Lanka that rehabilitates orphaned elephant calves with the goal of full release back into the wild. Four times a day, keepers bring out massive milk bottles and the calves stampede toward them. It is chaotic, loud, and completely irresistible.",
        lat: 6.4711,
        lng: 80.9167,
        radiusMeters: 200,
        coinReward: 50,
        xpCategory: 'WILD' as const,
        beforeYouGo: {
          bestTime: 'Feeding times: 9am, 12pm, 3pm, 6pm',
          dresscode: 'Casual',
          entryFee: 'Free to observe from the viewing platform',
          etiquette: 'No touching or feeding the calves',
        },
      },
    ],
  },

  // ── MOVE ──────────────────────────────────────────────────────────────────
  {
    id: 'arc_surf_south_coast',
    title: 'Surf the South Coast',
    slug: 'surf-south-coast',
    worldType: 'MOVE' as const,
    province: 'SOUTHERN' as const,
    narratorName: 'Kasun',
    introText: "The south coast picks up the Indian Ocean swell cleanly. From the gentle beach breaks of Weligama to the fast left-handers of Midigama, there's a wave for every level. Kasun grew up surfing these waters before the tourists arrived. He'll tell you where the crowd isn't.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'Weligama Bay',
        loreText: "Weligama Bay is the best place to learn to surf in Sri Lanka — the wave breaks slowly over a sandy bottom and there's room for everyone. The bay is sheltered, the water warm, and the local surf schools will have you standing by the end of your first lesson. The famous stilt fishermen work the shallow waters at the eastern end of the bay.",
        lat: 5.9738,
        lng: 80.4290,
        radiusMeters: 400,
        coinReward: 60,
        xpCategory: 'MOVE' as const,
        beforeYouGo: {
          bestTime: 'November to April for the best swell',
          dresscode: 'Rashguard recommended — sun is intense on the water',
          entryFee: 'Surf lessons from 2,500 LKR including board',
          etiquette: 'Give way to surfers already on a wave',
        },
      },
      {
        order: 2,
        title: 'Midigama Left',
        loreText: "Midigama is a serious wave — a long, fast left-hander that breaks over a shallow reef. It's not for beginners, but intermediate surfers will have the session of their trip here. The wave peels for 50-100 metres on a good swell day, giving you time to actually do something on it. The village is small and quiet; the surf community is tight-knit and welcoming.",
        lat: 5.9697,
        lng: 80.3742,
        radiusMeters: 300,
        coinReward: 75,
        xpCategory: 'MOVE' as const,
        beforeYouGo: {
          bestTime: 'December to March for consistent swells',
          dresscode: 'Reef booties recommended',
          entryFee: 'Board hire from 1,500 LKR/day',
          etiquette: 'Respect the locals in the lineup — they have priority',
        },
      },
      {
        order: 3,
        title: 'Hiriketiya Bowl',
        loreText: "Hiriketiya was a secret until about 2018. Now it's Sri Lanka's hippest surf cove — a horseshoe-shaped bay with a powerful beach break that works from both directions. The right-hand side is the crowd favourite; the left is faster and hollower. The village behind the beach has the best smoothie bowls on the coast.",
        lat: 5.9441,
        lng: 80.4453,
        radiusMeters: 350,
        coinReward: 80,
        xpCategory: 'MOVE' as const,
        beforeYouGo: {
          bestTime: 'Early morning before the onshore wind picks up',
          dresscode: 'Rashguard, fins for the shorebreak',
          entryFee: 'Board hire from 1,500 LKR/day',
          etiquette: 'The bowl gets crowded — be patient in the lineup',
        },
      },
    ],
  },
  {
    id: 'arc_ella_trails',
    title: 'Ella: Cloud Country Trails',
    slug: 'ella-cloud-country-trails',
    worldType: 'MOVE' as const,
    province: 'UVA' as const,
    narratorName: 'Dilani',
    introText: "Ella sits at 1,000 metres in the centre of Sri Lanka's tea country. The trails here go through jungle, tea estates, and cloud forest. Dilani runs these paths three times a week. She'll tell you which ones are worth the effort — and which ones the Instagram photos are lying about.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'Nine Arches Bridge',
        loreText: "The Nine Arches Bridge was built during British colonial rule, entirely without steel — the story goes that steel was unavailable because of the First World War, so the builder used only stone, brick, and cement. The result is one of the most photographed structures in Sri Lanka. Stand on the bridge when the blue train passes through the mist and it feels like a scene from another century.",
        lat: 6.8750,
        lng: 81.0590,
        radiusMeters: 250,
        coinReward: 50,
        xpCategory: 'MOVE' as const,
        beforeYouGo: {
          bestTime: '8:47am and 3:15pm train passes (check schedule — times vary)',
          dresscode: 'Walking shoes, the path through the tea estate is muddy',
          entryFee: 'Free',
          etiquette: 'Never stand on the tracks — trains come faster than they sound',
        },
      },
      {
        order: 2,
        title: 'Ella Rock Summit',
        loreText: "The trail to Ella Rock is not well-marked, which is part of its charm. You navigate by feel, through tea estates and jungle, gaining 300 metres over about 4km. At the top, on a clear day, you can see the south coast — a silver line at the edge of the green. The summit is a flat rock big enough for six people. Bring lunch.",
        lat: 6.8600,
        lng: 81.0460,
        radiusMeters: 300,
        coinReward: 100,
        xpCategory: 'MOVE' as const,
        beforeYouGo: {
          bestTime: 'Early morning — cloud rolls in by 11am most days',
          dresscode: 'Proper trail shoes, long pants for the jungle section',
          entryFee: 'Free — a guide costs around 2,000 LKR and is worth it',
          etiquette: 'Take all rubbish back down with you',
        },
      },
    ],
  },

  // ── RESTORE ───────────────────────────────────────────────────────────────
  {
    id: 'arc_tea_country_reset',
    title: 'The Tea Country Reset',
    slug: 'tea-country-reset',
    worldType: 'RESTORE' as const,
    province: 'CENTRAL' as const,
    narratorName: 'Malini',
    introText: "Nuwara Eliya sits at 1,868 metres. The air is different up here — cooler, quieter, smelling of eucalyptus and rain. Malini calls it the lungs of the island. She moved back from Colombo three years ago. She hasn't regretted it for a single day.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'Pedro Tea Estate',
        loreText: "Pedro is one of the oldest tea estates in Sri Lanka, established in the 1880s. The factory still uses machinery from the colonial era — it's one of the few places you can watch the full tea-making process, from withered leaf to finished product, under one roof. The orange pekoe they produce here is some of the finest in the country.",
        lat: 6.9745,
        lng: 80.7730,
        radiusMeters: 300,
        coinReward: 60,
        xpCategory: 'RESTORE' as const,
        beforeYouGo: {
          bestTime: '8am–4pm weekdays for the factory tour',
          dresscode: 'Comfortable walking shoes for the estate paths',
          entryFee: '200 LKR factory tour, tea tasting included',
          etiquette: 'No touching the machinery during the tour',
        },
      },
      {
        order: 2,
        title: 'Gregory Lake at Dusk',
        loreText: "Gregory Lake was built by the British in 1873 as a reservoir for Nuwara Eliya town. Today it's the social centre of the hill country — paddle boats drift in the afternoon, horses trot along the banks, and the sunset turns the water orange and pink. In the cool of the evening, the whole town seems to slow down and breathe.",
        lat: 6.9567,
        lng: 80.7718,
        radiusMeters: 350,
        coinReward: 50,
        xpCategory: 'RESTORE' as const,
        beforeYouGo: {
          bestTime: '4–6pm for the golden hour light on the water',
          dresscode: 'Bring a layer — evenings drop to 12°C',
          entryFee: 'Free to walk around. Paddle boats ~500 LKR/30 min.',
          etiquette: 'Peaceful atmosphere — keep noise down',
        },
      },
      {
        order: 3,
        title: 'Horton Plains at Sunrise',
        loreText: "Horton Plains is a high plateau at 2,100 metres — one of the last stretches of cloud forest in Sri Lanka. The trail to World's End drops 880 metres off a sheer cliff face into the lowland jungle below. On a clear morning, you can see the south coast. On a foggy morning, you see nothing but white, and it's somehow better.",
        lat: 6.8019,
        lng: 80.8046,
        radiusMeters: 400,
        coinReward: 90,
        xpCategory: 'RESTORE' as const,
        beforeYouGo: {
          bestTime: 'Be at World\'s End before 9am — cloud covers it by mid-morning',
          dresscode: 'Warm layers, waterproof jacket, good walking shoes',
          entryFee: 'USD 25 national park entry',
          etiquette: 'No food on the trail — sambar deer will steal your bag',
        },
      },
    ],
  },

  // ── ROOTS ─────────────────────────────────────────────────────────────────
  {
    id: 'arc_galle_fort',
    title: 'Galle Fort: A Dutch Legacy',
    slug: 'galle-fort-dutch-legacy',
    worldType: 'ROOTS' as const,
    province: 'SOUTHERN' as const,
    narratorName: 'Chaminda',
    introText: "Galle Fort was built by the Portuguese in 1588 and captured by the Dutch in 1640. The Dutch rebuilt it almost entirely. People still live inside. The fort is not a museum — it's a neighbourhood where the past and present share the same narrow streets. Chaminda was born here. His family has lived inside the walls for four generations.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'The Fort Gate',
        loreText: "The Main Gate of Galle Fort bears both the Dutch VOC monogram — the symbol of the Dutch East India Company, one of the most powerful corporations in history — and the British coat of arms, added after 1796. Two empires, one gate. The Fort was captured by the British from the Dutch without a single shot being fired: the Dutch simply handed over the keys.",
        lat: 6.0276,
        lng: 80.2165,
        radiusMeters: 150,
        coinReward: 50,
        xpCategory: 'ROOTS' as const,
        beforeYouGo: {
          bestTime: 'Any time — but morning light hits the gate beautifully',
          dresscode: 'Comfortable shoes for the cobblestones',
          entryFee: 'Free to enter the fort',
          etiquette: 'The streets are narrow — keep to the side for traffic',
        },
      },
      {
        order: 2,
        title: 'Dutch Reformed Church',
        loreText: "Built in 1755, the Dutch Reformed Church is the oldest Protestant church in Sri Lanka. The floor is made entirely of Dutch tombstones — the names, dates, and VOC symbols of colonial officials and merchants worn smooth by three centuries of feet. The church is still active. Sunday services are held here in Sinhala.",
        lat: 6.0271,
        lng: 80.2153,
        radiusMeters: 150,
        coinReward: 60,
        xpCategory: 'ROOTS' as const,
        beforeYouGo: {
          bestTime: 'Weekdays 9am–5pm',
          dresscode: 'Cover shoulders and knees',
          entryFee: 'Small donation appreciated',
          etiquette: 'Quiet inside — it is still a working church',
        },
      },
      {
        order: 3,
        title: 'The Ramparts at Sunset',
        loreText: "The ramparts of Galle Fort are 36 metres above sea level at their highest point. Every evening, the whole town walks here to watch the sun go down over the Indian Ocean. Vendors sell king coconuts, couples sit on the cannon emplacements, children run along the wall. The sun drops fast at this latitude. You get about three minutes of perfect light. Don't miss it.",
        lat: 6.0225,
        lng: 80.2184,
        radiusMeters: 200,
        coinReward: 70,
        xpCategory: 'ROOTS' as const,
        beforeYouGo: {
          bestTime: '30 minutes before sunset for the best spot',
          dresscode: 'Casual',
          entryFee: 'Free',
          etiquette: 'Watch your step on the cannon emplacements — no railings',
        },
      },
    ],
  },

  // ── TASTE ─────────────────────────────────────────────────────────────────
  {
    id: 'arc_jaffna_table',
    title: 'The Jaffna Table',
    slug: 'jaffna-table',
    worldType: 'TASTE' as const,
    province: 'NORTHERN' as const,
    narratorName: 'Vani',
    introText: "Jaffna cuisine is Sri Lanka's most misunderstood food culture. It's Tamil, not Sinhalese — heavier on palmyrah products, freshwater fish, and a different spice profile entirely. Vani's grandmother cooked everything from scratch. Vani is trying to remember all of it before it disappears.",
    isPublished: true,
    chapters: [
      {
        order: 1,
        title: 'Jaffna Market at Dawn',
        loreText: "The Jaffna Municipal Market opens before sunrise. The fish section alone is worth the trip — species you've never seen, handled by vendors who can gut and fillet a parrot fish in under a minute. The palmyrah section sells every part of the tree: the sap fermented into toddy, the young shoots eaten raw, the fruit processed into flour. Nothing goes to waste.",
        lat: 9.6615,
        lng: 80.0088,
        radiusMeters: 250,
        coinReward: 60,
        xpCategory: 'TASTE' as const,
        beforeYouGo: {
          bestTime: '5:30–8am before the heat sets in',
          dresscode: 'Modest clothing — Jaffna is conservative',
          entryFee: 'Free',
          etiquette: 'Ask before photographing vendors or their goods',
        },
      },
      {
        order: 2,
        title: 'Crab Curry at the Lagoon',
        loreText: "The Jaffna lagoon produces some of the finest mud crabs in Asia. The local preparation — slow-cooked in a black curry with roasted spices and coconut milk — is nothing like the crab curries you find in Colombo. It's darker, more complex, and absolutely inseparable from a cold Lion Lager. The restaurants on the lagoon shore serve it fresh, meaning they caught it this morning.",
        lat: 9.6589,
        lng: 80.0226,
        radiusMeters: 300,
        coinReward: 75,
        xpCategory: 'TASTE' as const,
        beforeYouGo: {
          bestTime: 'Lunch 12–2pm for the freshest catch',
          dresscode: 'Casual — this is a hands-on meal',
          entryFee: 'Crab curry from 1,200–2,000 LKR depending on size',
          etiquette: 'Eat with your right hand — it\'s the local way',
        },
      },
    ],
  },

  // ── ANCIENT KINGDOMS (existing) ───────────────────────────────────────────
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
