/**
 * MoodInsights – weekly mood frequency, trend, and plain-language summary.
 * Uses existing MoodEntry[] from mood history. Mocks if data is empty.
 */
import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { MoodEntry, MoodLabel } from '@/types'

interface Props {
  history: MoodEntry[]
  isLoading?: boolean
}

const MOOD_LABEL: Record<MoodLabel, string> = {
  happy: 'happy', sad: 'sad', stressed: 'stressed', relaxed: 'relaxed', neutral: 'neutral',
}

const MOOD_COLOR: Record<MoodLabel, string> = {
  happy:    'bg-amber-400',
  relaxed:  'bg-emerald-400',
  neutral:  'bg-slate-400',
  sad:      'bg-blue-400',
  stressed: 'bg-red-400',
}

const MOOD_BG: Record<MoodLabel, string> = {
  happy:    'bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-400',
  relaxed:  'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400',
  neutral:  'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400',
  sad:      'bg-blue-50 dark:bg-blue-900/15 text-blue-700 dark:text-blue-400',
  stressed: 'bg-red-50 dark:bg-red-900/15 text-red-700 dark:text-red-400',
}

// Generate an insight sentence from the frequency data
function buildInsight(
  top: MoodLabel,
  topCount: number,
  trend: 'up' | 'down' | 'stable',
  total: number,
): string {
  if (total === 0) return "Start logging your mood to see weekly insights here."

  const trendStr =
    trend === 'up'     ? "Your mood has been improving — great momentum." :
    trend === 'down'   ? "Your mood has dipped this week. Consider a short walk or journaling." :
                         "Your mood has been fairly consistent this week."

  if (top === 'stressed' && topCount >= 3)
    return `You've felt stressed ${topCount}× this week. ${trendStr}`
  if (top === 'sad' && topCount >= 2)
    return `You've logged feeling sad ${topCount}× this week. Small acts of self-care can help. ${trendStr}`
  if (top === 'happy' || top === 'relaxed')
    return `You've felt ${MOOD_LABEL[top]} ${topCount}× this week — that's wonderful. ${trendStr}`

  return `Your most frequent mood this week was ${MOOD_LABEL[top]} (${topCount}×). ${trendStr}`
}

// Keep only entries from the past 7 days
function lastWeek(history: MoodEntry[]): MoodEntry[] {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return history.filter((e) => new Date(e.created_at).getTime() >= cutoff)
}

// Mock 7-day history for demo/empty state
const MOCK: MoodEntry[] = [
  { id: 1, mood: 'happy',    emotion: 'joyful',  confidence: 0.9, mood_score: 8, source_message: null, ai_insight: null, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 2, mood: 'stressed', emotion: 'anxious', confidence: 0.8, mood_score: 4, source_message: null, ai_insight: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 3, mood: 'stressed', emotion: 'anxious', confidence: 0.8, mood_score: 3, source_message: null, ai_insight: null, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 4, mood: 'relaxed',  emotion: 'calm',    confidence: 0.9, mood_score: 7, source_message: null, ai_insight: null, created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 5, mood: 'neutral',  emotion: 'okay',    confidence: 0.7, mood_score: 5, source_message: null, ai_insight: null, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 6, mood: 'happy',    emotion: 'content', confidence: 0.9, mood_score: 8, source_message: null, ai_insight: null, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
]

export default function MoodInsights({ history, isLoading = false }: Props) {
  const data = useMemo(() => {
    const week = lastWeek(history.length ? history : MOCK)
    const isMock = !history.length

    // Frequency count
    const freq = { happy: 0, sad: 0, stressed: 0, relaxed: 0, neutral: 0 } as Record<MoodLabel, number>
    week.forEach((e) => { freq[e.mood] = (freq[e.mood] ?? 0) + 1 })

    const sorted = (Object.entries(freq) as [MoodLabel, number][])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])

    const [top, topCount] = sorted[0] ?? ['neutral' as MoodLabel, 0]
    const total = week.length

    // Simple trend: compare avg score of first half vs second half of week
    const mid = Math.floor(week.length / 2)
    const avgFirst  = week.slice(0, mid).reduce((s, e) => s + e.mood_score, 0) / (mid || 1)
    const avgSecond = week.slice(mid).reduce((s, e) => s + e.mood_score, 0) / ((week.length - mid) || 1)
    const trend: 'up' | 'down' | 'stable' =
      avgSecond - avgFirst > 0.5 ? 'up' :
      avgFirst - avgSecond > 0.5 ? 'down' : 'stable'

    const maxCount = Math.max(...Object.values(freq), 1)

    return { sorted, freq, top, topCount, total, trend, maxCount, isMock }
  }, [history])

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-brand-600" />
          <h3>This Week's Mood</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {data.trend === 'up'     && <><TrendingUp  className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">Improving</span></>}
          {data.trend === 'down'   && <><TrendingDown className="w-3.5 h-3.5 text-red-500"     /><span className="text-red-600 dark:text-red-400">Declining</span></>}
          {data.trend === 'stable' && <><Minus        className="w-3.5 h-3.5 text-slate-400"   /><span className="text-slate-500 dark:text-slate-400">Stable</span></>}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-7 rounded-lg" />)}
        </div>
      ) : (
        <>
          {/* Frequency bars */}
          <div className="space-y-2.5">
            {data.sorted.map(([mood, count]) => (
              <div key={mood} className="flex items-center gap-3">
                <span className={`text-xs font-medium w-16 capitalize rounded-md px-1.5 py-0.5 text-center ${MOOD_BG[mood]}`}>
                  {mood}
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / data.maxCount) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${MOOD_COLOR[mood]}`}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right tabular-nums">
                  {count}× {count === 1 ? 'time' : 'times'}
                </span>
              </div>
            ))}
          </div>

          {/* Insight text */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
            {buildInsight(data.top, data.topCount, data.trend, data.total)}
            {data.isMock && (
              <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                Showing sample data — log moods to see your real patterns.
              </span>
            )}
          </p>
        </>
      )}
    </div>
  )
}
