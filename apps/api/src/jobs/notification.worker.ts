import { Worker } from 'bullmq'
import { redis } from '../utils/redis'

export function startNotificationWorker() {
  const worker = new Worker(
    'notifications',
    async (job) => {
      const { userId, badges } = job.data as { userId: string; badges: string[] }
      console.log(`[Notifications] Sending badge notification to ${userId}:`, badges)
      // TODO: integrate Expo Push / FCM / APNs
    },
    { connection: redis },
  )

  worker.on('failed', (job, err) => {
    console.error(`[Notification Worker] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
