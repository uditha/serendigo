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

export interface BadgeEarned {
  id: string
  name: string
  description: string
  icon: string
}

export interface CaptureResult {
  captureId: string
  coinsEarned: number
  xpEarned: number
  xpCategory: string
  loreText: string
  arcComplete: boolean
  badgesEarned: BadgeEarned[]
}

export async function submitCapture(params: {
  chapterId: string
  photoUri: string
  lat: number
  lng: number
  note?: string
}): Promise<CaptureResult> {
  const token = await getToken()

  const form = new FormData()
  form.append('chapterId', params.chapterId)
  form.append('lat', String(params.lat))
  form.append('lng', String(params.lng))
  if (params.note) form.append('note', params.note)

  // Append photo as a file blob
  const filename = params.photoUri.split('/').pop() ?? 'photo.jpg'
  form.append('photo', {
    uri: params.photoUri,
    name: filename,
    type: 'image/jpeg',
  } as unknown as Blob)

  const response = await fetch(`${API_URL}/api/capture`, {
    method: 'POST',
    headers: {
      'Origin': API_URL ?? 'http://localhost:3000',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.message ?? body?.error ?? `API error ${response.status}`)
  }

  const json = await response.json()
  return json.data as CaptureResult
}
