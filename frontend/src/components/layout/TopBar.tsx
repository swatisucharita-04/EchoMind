import { useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import MoodBadge from '@/components/mood/MoodBadge'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/mood-check': 'Mood Check-in',
  '/chat':       'AI Chat',
  '/journal':    'Journal',
  '/analytics':  'Analytics',
  '/profile':    'Profile',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function TopBar() {
  const { theme, toggleTheme, currentMood } = useUIStore()
  const appUser = useAuthStore((s) => s.appUser)
  const { pathname } = useLocation()

  const pageTitle = PAGE_TITLES[pathname] ?? 'EchoMind'
  const firstName = appUser?.display_name?.split(' ')[0]

  return (
    <header className="h-14 flex items-center justify-between px-5 flex-shrink-0
      bg-white/90 dark:bg-gray-950/90 backdrop-blur-md
      border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">

      {/* Left – page title (primary wayfinding) */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {pageTitle}
        </h2>
        {currentMood && <MoodBadge mood={currentMood} size="xs" />}
      </div>

      {/* Right – minimal actions */}
      <div className="flex items-center gap-1">
        {/* Show greeting only if name known */}
        {firstName && (
          <span className="hidden sm:block text-xs text-gray-400 mr-2">
            {getGreeting()}, {firstName}
          </span>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
            hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light'
            ? <Moon className="w-4 h-4" />
            : <Sun  className="w-4 h-4" />
          }
        </button>

        {/* User avatar */}
        <div className="ml-1.5 pl-2.5 border-l border-gray-200 dark:border-gray-700">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
