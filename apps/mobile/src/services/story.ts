import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL

async function getToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem('auth-storage')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

export interface StoryXP {
  taste: number
  wild: number
  move: number
  roots: number
  restore: number
  total: number
}

export interface Journey {
  arcId: string
  title: string
  worldType: string
  totalChapters: number
  capturedChapters: number
  enrolledAt: string
  isComplete: boolean
}

export interface StoryStats {
  totalCaptures: number
  arcsEnrolled: number
  arcsCompleted: number
}

export interface StoryData {
  xp: StoryXP
  journeys: Journey[]
  stats: StoryStats
}

export async function fetchStory(): Promise<StoryData> {
  const token = await getToken()
  const response = await fetch(`${API_URL}/api/story`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!response.ok) throw new Error('Failed to load story')
  const json = await response.json()
  const payload = json?.data as StoryData | undefined
  if (!payload || !Array.isArray(payload.journeys) || !payload.xp) {
    throw new Error('Invalid story response')
  }
  return payload
}
