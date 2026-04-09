const API_URL = process.env.EXPO_PUBLIC_API_URL

if (!API_URL) {
  console.warn('[API] EXPO_PUBLIC_API_URL not set — requests will fail')
}

export async function fetchFromApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}
