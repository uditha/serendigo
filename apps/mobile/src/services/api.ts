const API_URL = process.env.EXPO_PUBLIC_API_URL

if (!API_URL) {
  console.warn('[API] EXPO_PUBLIC_API_URL not set — requests will fail')
}

export async function fetchFromApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    // Try to parse error message from API response body
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.message ?? body?.error ?? `API error ${response.status}`)
  }
  return response.json()
}
