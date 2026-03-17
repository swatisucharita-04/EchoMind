import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { setupAuthInterceptor, authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import AppLayout from '@/components/layout/AppLayout'
import ImmersiveLayout from '@/components/layout/ImmersiveLayout'

// ── Eager-loaded (needed immediately) ──────────────────────
import LandingPage  from '@/pages/LandingPage'
import SignInPage   from '@/pages/SignInPage'
import SignUpPage   from '@/pages/SignUpPage'

// ── Lazy-loaded (only fetch when user navigates there) ─────
const DashboardPage  = lazy(() => import('@/pages/DashboardPage'))
const MoodInputPage  = lazy(() => import('@/pages/MoodInputPage'))
const ChatPage       = lazy(() => import('@/pages/ChatPage'))
const JournalPage    = lazy(() => import('@/pages/JournalPage'))
const AnalyticsPage  = lazy(() => import('@/pages/AnalyticsPage'))
const ProfilePage    = lazy(() => import('@/pages/ProfilePage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded)   return <FullPageSpinner />
  if (!isSignedIn) return <Navigate to="/sign-in" replace />
  return <>{children}</>
}

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading EchoMind…</p>
      </div>
    </div>
  )
}

export default function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const setAppUser = useAuthStore((s) => s.setAppUser)
  const { theme }  = useUIStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    setupAuthInterceptor(getToken)
  }, [getToken])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return
    authApi.sync({
      email:        user.primaryEmailAddress?.emailAddress ?? '',
      display_name: user.fullName ?? user.username ?? undefined,
      avatar_url:   user.imageUrl ?? undefined,
    }).then(setAppUser).catch(console.error)
  }, [isLoaded, isSignedIn, user, setAppUser])

  return (
    <Routes>
      {/* Public */}
      <Route path="/"          element={<LandingPage />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected – full-screen immersive layout (no sidebar) */}
      <Route element={<RequireAuth><ImmersiveLayout /></RequireAuth>}>
        <Route path="/mood-check" element={<Suspense fallback={<PageLoader />}><MoodInputPage /></Suspense>} />
      </Route>

      {/* Protected – standard app layout with sidebar */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard"  element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
        <Route path="/chat"       element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
        <Route path="/journal"    element={<Suspense fallback={<PageLoader />}><JournalPage /></Suspense>} />
        <Route path="/analytics"  element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
        <Route path="/profile"    element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="/app"        element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
