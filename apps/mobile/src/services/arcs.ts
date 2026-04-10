import { fetchFromApi } from './api'

export interface ArcProgress {
  id: string
  userId: string
  arcId: string
  enrolledAt: string
  completedAt: string | null
  totalChapters: number
  completedChapters: number
  completedChapterIds: string[]
  isComplete: boolean
}

export function fetchArcProgress(arcId: string): Promise<ArcProgress> {
  return fetchFromApi<{ success: boolean; data: ArcProgress }>(`/api/arcs/${arcId}/progress`).then(
    (r) => r.data,
  )
}

export function enrollInArc(arcId: string): Promise<ArcProgress> {
  return fetchFromApi<{ success: boolean; data: ArcProgress }>(`/api/arcs/${arcId}/enroll`, {
    method: 'POST',
  }).then((r) => r.data)
}
