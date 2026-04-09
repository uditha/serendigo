import { Queue } from 'bullmq'
import { redis } from '../utils/redis'

// Queues are only created when Redis is available
const makeQueue = (name: string) =>
  redis ? new Queue(name, { connection: redis }) : null

export const badgeQueue = makeQueue('badges')
export const notificationQueue = makeQueue('notifications')
export const leaderboardQueue = makeQueue('leaderboard')

export async function startWorkers() {
  if (!redis) return

  const [{ startBadgeWorker }, { startNotificationWorker }] = await Promise.all([
    import('./badge.worker'),
    import('./notification.worker'),
  ])

  startBadgeWorker()
  startNotificationWorker()

  console.log('[Jobs] Workers started')
}
