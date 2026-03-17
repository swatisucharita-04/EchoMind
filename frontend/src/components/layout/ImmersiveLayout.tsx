/**
 * ImmersiveLayout – full-screen layout for the Flocus-inspired immersive pages.
 * No sidebar, no topbar — just full viewport canvas.
 * Still requires authentication (reuses RequireAuth from App.tsx via the route guard).
 *
 * Provides:
 *  - Back-to-dashboard escape hatch (top-left)
 *  - Theme toggle (top-right)
 *  - The MoodBackground driven by the current mood in uiStore
 */
import { Outlet, Link } from 'react-router-dom'
import { Sun, Moon, LayoutDashboard } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import MoodBackground from '@/components/common/MoodBackground'

export default function ImmersiveLayout() {
  const { theme, toggleTheme, currentMood } = useUIStore()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-screen mood gradient */}
      <MoodBackground mood={currentMood} />

      {/* Top-left: back to dashboard */}
      <div className="absolute top-5 left-5 z-20">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl
            bg-white/10 hover:bg-white/20 border border-white/20
            text-white/80 hover:text-white text-xs font-medium
            backdrop-blur-sm transition-colors duration-150"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </div>

      {/* Top-right: theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full flex items-center justify-center
            bg-white/10 hover:bg-white/20 border border-white/20
            text-white/70 hover:text-white backdrop-blur-sm transition-colors duration-150"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* Page content — centred on the canvas */}
      <main className="relative z-10 w-full px-4 py-16 flex flex-col items-center">
        <Outlet />
      </main>

      {/* Bottom branding */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20
        text-white/30 text-[11px] tracking-wider select-none">
        EchoMind — your emotional companion
      </p>
    </div>
  )
}
