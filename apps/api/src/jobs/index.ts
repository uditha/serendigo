// Re-export queues so the rest of the app imports from one place
export { badgeQueue, notificationQueue, leaderboardQueue, arcProgressQueue } from './queues'

export async function startWorkers() {
  const [
    { startBadgeWorker },
    { startNotificationWorker },
    { startArcProgressWorker },
  ] = await Promise.all([
    import('./badge.worker'),
    import('./notification.worker'),
    import('./arc-progress.worker'),
  ])

  startBadgeWorker()
  startNotificationWorker()
  startArcProgressWorker()

  console.log('[Jobs] Workers started')
}
