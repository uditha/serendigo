import { Worker } from 'bullmq'
import { redis } from '../utils/redis'
import { checkAndAwardBadges } from '../services/badge.service'

export function startBadgeWorker() {
  const worker = new Worker(
    'badges',
    async (job) => {
      const { userId } = job.data as { userId: string }
      const newBadges = await checkAndAwardBadges(userId)

      if (newBadges.length > 0) {
        console.log(`[Badge Worker] Awarded ${newBadges.length} badge(s) to ${userId}:`, newBadges.map((b) => b.id).join(', '))
      }
    },
    { connection: redis },
  )

  worker.on('failed', (job, err) => {
    console.error(`[Badge Worker] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
