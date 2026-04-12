import { useQuery } from '@tanstack/react-query'
import { fetchFromApi } from '@/src/services/api'

export interface ArcPin {
  id: string
  title: string
  slug: string
  worldType: 'TASTE' | 'WILD' | 'MOVE' | 'ROOTS' | 'RESTORE'
  province: string
  coverImage: string | null
  chapters: Array<{
    id: string
    lat: number
    lng: number
    title: string
    order: number
  }>
}

export function useArcs() {
  return useQuery({
    queryKey: ['arcs'],
    queryFn: () =>
      fetchFromApi<{ success: boolean; data: ArcPin[] }>('/api/arcs').then(
        (res) => res.data
      ),
    staleTime: 10 * 60 * 1000,
  })
}
