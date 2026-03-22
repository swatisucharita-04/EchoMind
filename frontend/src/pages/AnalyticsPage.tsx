import { useQuery } from '@tanstack/react-query'
import { analyticsApi, moodApi } from '@/api/client'
import MoodChart from '@/components/mood/MoodChart'
import MoodDistributionChart from '@/components/mood/MoodDistributionChart'
import AIInsightCard from '@/components/dashboard/AIInsightCard'
import MoodBadge from '@/components/mood/MoodBadge'
import StatCard from '@/components/common/StatCard'
import { format, parseISO } from 'date-fns'
import { TrendingUp, Smile, Activity, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AnalyticsPage() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: analyticsApi.dashboard,
  })

  const { data: moodHistory = [], isLoading: moodLoading } = useQuery({
    queryKey: ['mood-history'],
    queryFn: () => moodApi.history(50),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Deep dive into your emotional patterns</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Smile,    label: 'Positive Days (30d)', value: `${analytics?.stats.positive_days_pct ?? '–'}%`,    color: 'text-amber-500'   },
          { icon: TrendingUp, label: 'Avg Mood Score',   value: `${analytics?.stats.avg_mood_score ?? '–'}/10`,     color: 'text-emerald-500' },
          { icon: Activity, label: 'Total Mood Entries', value: `${analytics?.stats.total_entries ?? '–'}`,          color: 'text-brand-500'   },
          { icon: BookOpen, label: 'Journal Streak',     value: `${analytics?.stats.journal_streak ?? 0} days`,     color: 'text-violet-500'  },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-4">Weekly Mood Trend</h3>
          {analyticsLoading
            ? <div className="skeleton h-48 rounded-xl" />
            : <MoodChart data={analytics?.weekly_trend ?? []} />
          }
        </div>
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-4">30-Day Mood Distribution</h3>
          {analyticsLoading
            ? <div className="skeleton h-48 rounded-xl" />
            : <MoodDistributionChart data={analytics?.mood_distribution ?? { happy: 0, sad: 0, stressed: 0, relaxed: 0, neutral: 0 }} />
          }
        </div>
      </div>

      {/* AI Insight */}
      <AIInsightCard insight={analytics?.ai_insight ?? ''} isLoading={analyticsLoading} />

      {/* Mood history table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Recent Mood History</h3>
          <span className="text-xs text-gray-400">{moodHistory.length} entries</span>
        </div>

        {moodLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : moodHistory.length === 0 ? (
          <div className="py-20 text-center relative overflow-hidden flex flex-col items-center justify-center border-t border-white/5">
             <div className="absolute inset-0 flex items-end justify-center opacity-[0.25] dark:opacity-[0.15] pointer-events-none blur-sm select-none">
               <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-[120%] h-24 text-brand-500 fill-current"><path d="M0,30 L0,15 C20,15 30,5 50,20 C70,35 80,10 100,5 L100,30 Z" /></svg>
             </div>
             <p className="text-4xl mb-4 relative z-10">📊</p>
             <p className="font-semibold text-gray-800 dark:text-gray-200 relative z-10 text-base">Start tracking your mood to unlock insights</p>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 relative z-10">Log your daily vibes to see emotional trends</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 dark:divide-white/5">
            {moodHistory.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MoodBadge mood={entry.mood} size="xs" />
                  <span className="text-xs text-gray-500 capitalize">{entry.emotion}</span>
                  {entry.source_message && (
                    <span className="text-xs text-gray-400 truncate max-w-[180px] hidden md:block">
                      "{entry.source_message.slice(0, 55)}{entry.source_message.length > 55 ? '…' : ''}"
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full w-16">
                      <div
                        className="h-1.5 bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all"
                        style={{ width: `${(entry.mood_score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-7 text-right">{entry.mood_score}</span>
                  </div>
                  <span className="text-xs text-gray-400 hidden sm:block w-28 text-right">
                    {format(parseISO(entry.created_at), 'MMM d · h:mm a')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
