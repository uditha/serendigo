const API_URL = process.env.EXPO_PUBLIC_API_URL

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string | null
  travellerCharacter: string | null
  serendipityCoins: number
  totalCaptures: number
}

export type LeaderboardPeriod = 'all' | 'week' | 'month'

export async function fetchLeaderboard(period: LeaderboardPeriod = 'all'): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_URL}/api/leaderboard?period=${period}`)
  if (!response.ok) throw new Error('Failed to load leaderboard')
  const json = await response.json()
  return json.data as LeaderboardEntry[]
}
