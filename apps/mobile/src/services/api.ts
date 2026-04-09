import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL

if (!API_URL) {
  console.warn('[API] EXPO_PUBLIC_API_URL not set — requests will fail')
}

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

export async function fetchFromApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.message ?? body?.error ?? `API error ${response.status}`)
  }
  return response.json()
}
