import { useQuery } from '@tanstack/react-query'
import { Smile, TrendingUp, BookOpen, Activity, Sparkles } from 'lucide-react'
import { analyticsApi, moodApi, journalApi } from '@/api/client'
import MoodChart from '@/components/mood/MoodChart'
import MoodInsights from '@/components/mood/MoodInsights'
import StatCard from '@/components/common/StatCard'
import AIInsightCard from '@/components/dashboard/AIInsightCard'
import SpotifyPlayer from '@/components/dashboard/SpotifyPlayer'
import SmartNudge from '@/components/dashboard/SmartNudge'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

function greeting(name?: string | null) {
  const h = new Date().getHours()
  const t = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return name ? `Good ${t}, ${name}` : `Good ${t}`
}

export default function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn:  analyticsApi.dashboard,
    staleTime: 1000 * 60 * 5,
  })

  const { data: moodHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['mood-history-dashboard'],
    queryFn:  () => moodApi.history(30),
    staleTime: 1000 * 60 * 5,
  })

  // For SmartNudge — check recent journal activity
  const { data: journals = [] } = useQuery({
    queryKey: ['journal-recent'],
    queryFn:  () => journalApi.list(5),
    staleTime: 1000 * 60 * 5,
  })

  const appUser      = useAuthStore((s) => s.appUser)
  const { currentMood } = useUIStore()

  const recentJournalCount = journals.filter((j) => {
    const d = new Date(j.created_at)
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    return d.getTime() >= cutoff
  }).length

  const stats = [
    { icon: Smile,      label: 'Positive Days',  value: analyticsLoading ? '–' : `${analytics?.stats.positive_days_pct ?? 0}%`,  sub: 'Last 30 days', color: 'text-amber-500'   },
    { icon: TrendingUp, label: 'Avg Mood Score',  value: analyticsLoading ? '–' : `${analytics?.stats.avg_mood_score ?? 0}/10`,  sub: 'This week',    color: 'text-emerald-500' },
    { icon: Activity,   label: 'Mood Entries',    value: analyticsLoading ? '–' : String(analytics?.stats.total_entries ?? 0),    sub: 'Total',        color: 'text-brand-600'   },
    { icon: BookOpen,   label: 'Journal Streak',  value: analyticsLoading ? '–' : `${analytics?.stats.journal_streak ?? 0}d`,    sub: 'Keep going!',  color: 'text-violet-500'  },
  ]

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {greeting(appUser?.display_name?.split(' ')[0])} 👋
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/dashboard" className="btn-primary gap-1.5">
          <Sparkles className="w-4 h-4" />
          Check in
        </Link>
      </div>

      {/* Smart Nudge – contextual CTA */}
      <SmartNudge currentMood={currentMood} recentJournalCount={recentJournalCount} />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) =>
          analyticsLoading
            ? <div key={s.label} className="skeleton h-24 rounded-xl" />
            : <StatCard key={s.label} {...s} />
        )}
      </div>

      {/* Main content – 5-col split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left 3 cols – chart + AI insight */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-5">
            <h3 className="text-sm mb-4">Mood Trend — This Week</h3>
            {analyticsLoading
              ? <div className="skeleton h-44 rounded-xl" />
              : moodHistory.length === 0
                ? (
                  <div className="h-44 flex flex-col items-center justify-center gap-2 text-center">
                    <span className="text-3xl">📈</span>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No data yet</p>
                    <p className="text-xs text-gray-400">Log your first mood to start seeing trends</p>
                  </div>
                )
                : <MoodChart data={analytics?.weekly_trend ?? []} />
            }
          </div>
          <AIInsightCard insight={analytics?.ai_insight ?? ''} isLoading={analyticsLoading} />
        </div>

        {/* Right 2 cols – insights + music */}
        <div className="lg:col-span-2 space-y-5">
          <MoodInsights history={moodHistory} isLoading={historyLoading} />
          <SpotifyPlayer />
        </div>

      </div>
    </div>
  )
}
