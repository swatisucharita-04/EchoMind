/**
 * SmartNudge – a contextual call-to-action based on the user's recent activity.
 * Appears on the dashboard to gently guide users back into the product loop:
 *   Log mood → AI response → journal → see patterns → return.
 *
 * Logic (checked in order):
 *   1. No mood today        → nudge to check in
 *   2. Negative mood        → nudge to journal
 *   3. No journal recently  → nudge to write
 *   4. Default              → positive affirmation
 */
import { Link } from 'react-router-dom'
import { Sparkles, BookOpen, TrendingUp, Heart } from 'lucide-react'
import type { MoodLabel } from '@/types'

interface Props {
  /** User's current mood (from uiStore), null = not checked in today */
  currentMood: MoodLabel | null
  /** How many journal entries in the last 7 days */
  recentJournalCount: number
  /** Today's date string to compare against */
  lastCheckInDate?: string
}

interface Nudge {
  icon: typeof Sparkles
  iconColor: string
  bg: string
  heading: string
  body: string
  cta: string
  to: string
}

function resolveNudge(
  currentMood: MoodLabel | null,
  recentJournalCount: number,
): Nudge {
  // No mood logged yet today
  if (!currentMood) {
    return {
      icon: Sparkles,
      iconColor: 'text-brand-600',
      bg: 'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800',
      heading: "How are you feeling right now?",
      body: "Take 30 seconds to log your mood. Small check-ins lead to big insights over time.",
      cta: "Log today's mood",
      to: '/mood-check',
    }
  }

  // Tough mood — suggest journaling
  if (currentMood === 'stressed' || currentMood === 'sad') {
    return {
      icon: BookOpen,
      iconColor: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800',
      heading: "Writing can help",
      body: "You're going through something. Putting it in words — even a few sentences — often brings clarity.",
      cta: "Open journal",
      to: '/journal',
    }
  }

  // Hasn't journaled recently
  if (recentJournalCount === 0) {
    return {
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
      heading: "Start your writing habit",
      body: "You haven't journaled recently. Even a quick note helps EchoMind understand your patterns better.",
      cta: "Write an entry",
      to: '/journal',
    }
  }

  // Happy / relaxed — positive
  return {
    icon: Heart,
    iconColor: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
    heading: "You're doing great",
    body: "Consistency is what builds resilience. Keep checking in — your future self will thank you.",
    cta: "See your progress",
    to: '/analytics',
  }
}

export default function SmartNudge({ currentMood, recentJournalCount }: Props) {
  const nudge = resolveNudge(currentMood, recentJournalCount)
  const Icon = nudge.icon

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${nudge.bg} transition-colors`}>
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm ${nudge.iconColor}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{nudge.heading}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{nudge.body}</p>
      </div>
      <Link
        to={nudge.to}
        className="flex-shrink-0 text-xs font-semibold text-brand-600 dark:text-brand-400
          hover:text-brand-700 dark:hover:text-brand-300 whitespace-nowrap
          underline-offset-2 hover:underline transition-colors"
      >
        {nudge.cta} →
      </Link>
    </div>
  )
}
