const API_URL = process.env.EXPO_PUBLIC_API_URL

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string | null
  travellerCharacter: string | null
  serendipityCoins: number
  totalCaptures: number
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_URL}/api/leaderboard`)
  if (!response.ok) throw new Error('Failed to load leaderboard')
  const json = await response.json()
  return json.data as LeaderboardEntry[]
}
