import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MoodLabel } from '@/types'

interface UIStore {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  currentMood: MoodLabel | null
  setCurrentMood: (mood: MoodLabel | null) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),
      sidebarOpen: true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      currentMood: null,
      setCurrentMood: (mood) => set({ currentMood: mood }),
    }),
    { name: 'echomind-ui' }
  )
)
