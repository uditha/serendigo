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

export interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

export async function fetchBadges(): Promise<UserBadge[]> {
  const token = await getToken()
  const response = await fetch(`${API_URL}/api/badges`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!response.ok) throw new Error('Failed to load badges')
  const json = await response.json()
  return json.data as UserBadge[]
}
