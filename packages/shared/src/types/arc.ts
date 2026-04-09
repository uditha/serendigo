import type { WorldType, Province } from './world'

export interface Coordinates {
  lat: number
  lng: number
}

export interface Chapter {
  id: string
  arcId: string
  order: number
  title: string
  lore: string
  beforeYouGo: {
    bestTime?: string
    dresscode?: string
    entryFee?: string
    etiquette?: string
  }
  coordinates: Coordinates
  coinReward: number
  xpCategory: WorldType
}

export interface Arc {
  id: string
  slug: string
  title: string
  worldType: WorldType
  province: Province
  narrator: string
  introText: string
  chapters: Chapter[]
  isActive: boolean
  isSeasonal: boolean
  seasonalMonths?: number[] // 1–12
}

export interface UserArcProgress {
  arcId: string
  userId: string
  completedChapterIds: string[]
  startedAt: string
  completedAt?: string
}
