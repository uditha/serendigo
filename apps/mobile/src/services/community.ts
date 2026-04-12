import { fetchFromApi } from './api'

export interface CommunityCapture {
  id: string
  photoUrl: string
  note: string | null
  capturedAt: string
  likeCount: number
  likedByMe: boolean
  chapter: { id: string; title: string; order: number }
  arc: { id: string; title: string; worldType: string }
  user: { id: string; name: string | null }
}

export function getChapterCommunity(chapterId: string) {
  return fetchFromApi<{ success: boolean; data: CommunityCapture[] }>(
    `/api/community/chapter/${chapterId}`
  ).then((r) => r.data)
}

export function getArcCommunity(arcId: string) {
  return fetchFromApi<{ success: boolean; data: CommunityCapture[] }>(
    `/api/community/arc/${arcId}`
  ).then((r) => r.data)
}

export function getDiscoveryFeed(worldType?: string, offset = 0) {
  const params = new URLSearchParams()
  if (worldType) params.set('worldType', worldType)
  if (offset) params.set('offset', String(offset))
  const qs = params.toString()
  return fetchFromApi<{ success: boolean; data: CommunityCapture[] }>(
    `/api/community/feed${qs ? `?${qs}` : ''}`
  ).then((r) => r.data)
}

export function likeCapture(captureId: string) {
  return fetchFromApi<{ success: boolean }>(
    `/api/community/captures/${captureId}/like`,
    { method: 'POST' }
  )
}

export function unlikeCapture(captureId: string) {
  return fetchFromApi<{ success: boolean }>(
    `/api/community/captures/${captureId}/like`,
    { method: 'DELETE' }
  )
}
