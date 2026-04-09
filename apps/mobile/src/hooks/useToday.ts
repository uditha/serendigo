import { useQuery } from '@tanstack/react-query'
import { fetchFromApi } from '@/src/services/api'

interface TodayData {
  greeting: string
  location: string
}

export function useToday() {
  return useQuery({
    queryKey: ['today'],
    queryFn: () =>
      fetchFromApi<{ success: boolean; data: TodayData }>('/api/today').then(
        (res) => res.data
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
