import { MMKV } from 'react-native-mmkv'
import { create } from 'zustand'

const storage = new MMKV({ id: 'auth' })

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

export const useAuthStore = create<AuthState>((set) => ({
  token: storage.getString('token') ?? null,
  user: (() => {
    const raw = storage.getString('user')
    return raw ? JSON.parse(raw) : null
  })(),
  isLoggedIn: !!storage.getString('token'),

  setAuth: (token, user) => {
    storage.set('token', token)
    storage.set('user', JSON.stringify(user))
    set({ token, user, isLoggedIn: true })
  },

  clearAuth: () => {
    storage.delete('token')
    storage.delete('user')
    set({ token: null, user: null, isLoggedIn: false })
  },
}))
