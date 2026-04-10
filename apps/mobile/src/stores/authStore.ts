import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const API_URL = process.env.EXPO_PUBLIC_API_URL

interface AuthUser {
  id: string
  name: string
  email: string
  serendipityCoins: number
  level: number
  travellerCharacter?: string | null
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isLoggedIn: boolean
  isLocal: boolean | null
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  refreshUser: () => Promise<void>
  setIsLocal: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      isLocal: null,

      setAuth: (token, user) => {
        set({ token, user, isLoggedIn: true })
      },

      clearAuth: () => {
        set({ token: null, user: null, isLoggedIn: false })
      },

      setIsLocal: (value) => {
        set({ isLocal: value })
      },

      refreshUser: async () => {
        const token = get().token
        if (!token) return
        try {
          const res = await fetch(`${API_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) return
          const json = await res.json()
          set((state) => ({ user: { ...state.user!, ...json.data } }))
        } catch {
          // silently fail — stale data is better than a crash
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
