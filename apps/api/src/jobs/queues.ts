import { Queue } from 'bullmq'
import { redis } from '../utils/redis'

export const badgeQueue = new Queue('badges', { connection: redis })
export const notificationQueue = new Queue('notifications', { connection: redis })
export const leaderboardQueue = new Queue('leaderboard', { connection: redis })
export const arcProgressQueue = new Queue('arc-progress', { connection: redis })
