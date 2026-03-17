import { create } from 'zustand'
import type { AppUser } from '@/types'

interface AuthStore {
  appUser: AppUser | null
  setAppUser: (user: AppUser | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  appUser: null,
  setAppUser: (user) => set({ appUser: user }),
}))
