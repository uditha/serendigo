import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  name: string
  email: string
  serendipityCoins: number
  level: number
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isLoggedIn: boolean
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      setAuth: (token, user) => {
        set({ token, user, isLoggedIn: true })
      },

      clearAuth: () => {
        set({ token: null, user: null, isLoggedIn: false })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
