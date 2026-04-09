import { Worker } from 'bullmq'
import { redis } from '../utils/redis'
import { notificationQueue } from './index'
import { db } from '../db'
import { captures, userArcs } from '../db/schema'
import { eq, count } from 'drizzle-orm'

export function startBadgeWorker() {
  const worker = new Worker(
    'badges',
    async (job) => {
      const { userId } = job.data as { userId: string }
      const newBadges = await checkBadgeConditions(userId)

      if (newBadges.length > 0) {
        await notificationQueue.add('badge-earned', { userId, badges: newBadges })
      }
    },
    { connection: redis },
  )

  worker.on('failed', (job, err) => {
    console.error(`[Badge Worker] Job ${job?.id} failed:`, err.message)
  })

  return worker
}

async function checkBadgeConditions(userId: string): Promise<string[]> {
  const earned: string[] = []

  const [captureCount] = await db
    .select({ count: count() })
    .from(captures)
    .where(eq(captures.userId, userId))

  const total = captureCount?.count ?? 0

  if (total === 1) earned.push('first-capture')
  if (total === 10) earned.push('ten-captures')
  if (total === 50) earned.push('fifty-captures')

  const [arcCount] = await db
    .select({ count: count() })
    .from(userArcs)
    .where(eq(userArcs.userId, userId))

  if ((arcCount?.count ?? 0) >= 1) earned.push('arc-complete')

  return earned
}
