import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import {
  LayoutDashboard, MessageCircle, BookOpen,
  BarChart3, User, ChevronLeft, ChevronRight,
  Brain, Sparkles,
} from 'lucide-react'
import MoodBadge from '@/components/mood/MoodBadge'

const NAV = [
  { to: '/dashboard',   icon: Sparkles,         label: 'Mood Check-in'  },
  { to: '/overview',    icon: LayoutDashboard,  label: 'Overview'       },
  { to: '/chat',        icon: MessageCircle,    label: 'AI Chat'        },
  { to: '/journal',     icon: BookOpen,         label: 'Journal'        },
  { to: '/analytics',   icon: BarChart3,        label: 'Analytics'      },
  { to: '/profile',     icon: User,             label: 'Profile'        },
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, currentMood } = useUIStore()

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 flex flex-col
        bg-white dark:bg-gray-950
        border-r border-gray-100 dark:border-gray-800
        transition-[width] duration-200 ease-in-out
        ${sidebarOpen ? 'w-56' : 'w-14'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3.5 h-14 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="w-7 h-7 flex-shrink-0 bg-brand-600 rounded-lg flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-bold text-base text-gray-900 dark:text-white truncate">
            EchoMind
          </span>
        )}
      </div>

      {/* Current mood (collapsed: shows emoji only) */}
      {currentMood && (
        <div className={`mx-2.5 mt-3 ${sidebarOpen ? 'px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60' : 'flex justify-center py-2'}`}>
          {sidebarOpen ? (
            <>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Current mood</p>
              <MoodBadge mood={currentMood} size="sm" />
            </>
          ) : (
            <span className="text-xl" title={`Mood: ${currentMood}`}>
              {currentMood === 'happy' ? '😊' : currentMood === 'sad' ? '😢' : currentMood === 'stressed' ? '😰' : currentMood === 'relaxed' ? '😌' : '😐'}
            </span>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium
               transition-colors duration-100 relative group
               ${isActive
                ? 'nav-active'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}

            {/* Tooltip when collapsed */}
            {!sidebarOpen && (
              <span className="absolute left-12 z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                text-xs px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center h-11 flex-shrink-0
          border-t border-gray-100 dark:border-gray-800
          text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
          hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen
          ? <ChevronLeft  className="w-4 h-4" />
          : <ChevronRight className="w-4 h-4" />
        }
      </button>
    </aside>
  )
}
