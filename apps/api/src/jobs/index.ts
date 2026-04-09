import { Queue } from 'bullmq'
import { redis } from '../utils/redis'

export const badgeQueue = new Queue('badges', { connection: redis })
export const notificationQueue = new Queue('notifications', { connection: redis })
export const leaderboardQueue = new Queue('leaderboard', { connection: redis })

export async function startWorkers() {
  const [{ startBadgeWorker }, { startNotificationWorker }] = await Promise.all([
    import('./badge.worker'),
    import('./notification.worker'),
  ])

  startBadgeWorker()
  startNotificationWorker()

  console.log('[Jobs] Workers started')
}
