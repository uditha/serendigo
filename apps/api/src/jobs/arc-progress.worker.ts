import { Worker } from 'bullmq'
import { redis } from '../utils/redis'
import { db } from '../db'
import { arcPlaces, userPlaces, userArcs, arcs, users } from '../db/schema'
import { eq, and, count, sql } from 'drizzle-orm'

export function startArcProgressWorker() {
  const worker = new Worker(
    'arc-progress',
    async (job) => {
      const { userId, placeId } = job.data as { userId: string; placeId: string }
      await checkArcProgress(userId, placeId)
    },
    { connection: redis },
  )

  worker.on('failed', (job, err) => {
    console.error(`[Arc Progress Worker] Job ${job?.id} failed:`, err.message)
  })

  return worker
}

async function checkArcProgress(userId: string, placeId: string) {
  // Find all arcs that contain this place
  const affectedArcs = await db
    .select({ arcId: arcPlaces.arcId })
    .from(arcPlaces)
    .where(eq(arcPlaces.placeId, placeId))

  for (const { arcId } of affectedArcs) {
    // Total places in this arc
    const [totalRow] = await db
      .select({ total: count() })
      .from(arcPlaces)
      .where(eq(arcPlaces.arcId, arcId))

    // Places the user has captured in this arc
    const [capturedRow] = await db
      .select({ captured: count() })
      .from(arcPlaces)
      .innerJoin(
        userPlaces,
        and(eq(userPlaces.placeId, arcPlaces.placeId), eq(userPlaces.userId, userId)),
      )
      .where(eq(arcPlaces.arcId, arcId))

    const total = totalRow?.total ?? 0
    const captured = capturedRow?.captured ?? 0
    const isComplete = total > 0 && captured >= total

    // Upsert arc progress
    await db
      .insert(userArcs)
      .values({
        userId,
        arcId,
        status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        placesCompleted: captured,
        startedAt: new Date(),
        completedAt: isComplete ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: sql`(user_id, arc_id)`,
        set: {
          status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
          placesCompleted: captured,
          completedAt: isComplete ? new Date() : null,
        },
      })

    // Award completion bonus if just completed
    if (isComplete) {
      const arc = await db.query.arcs.findFirst({ where: eq(arcs.id, arcId) })
      if (arc && arc.completionBonus > 0) {
        await db.execute(sql`
          UPDATE users SET
            serendipity_coins = serendipity_coins + ${arc.completionBonus}
          WHERE id = ${userId}
        `)
      }
    }
  }
}
