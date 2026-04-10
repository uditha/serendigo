import { fetchFromApi } from './api'

export interface ProvinceStamp {
  provinceId: string
  provinceName: string
  provinceSlug: string
  stampDesignKey: string | null
  fillColor: string | null
  totalArcs: number
  completedArcs: number
  isComplete: boolean
}

export function fetchPassport(): Promise<ProvinceStamp[]> {
  return fetchFromApi<{ success: boolean; data: ProvinceStamp[] }>('/api/passport').then(
    (r) => r.data,
  )
}
