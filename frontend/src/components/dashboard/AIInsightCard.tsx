import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Props {
  insight: string
  isLoading?: boolean
}

export default function AIInsightCard({ insight, isLoading = false }: Props) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-lg border border-white/40 dark:border-white/10 relative overflow-hidden group shadow-sm transition-shadow hover:shadow-md">
      {/* Gradient header */}
      <div className="px-5 py-4 border-b border-white/20 dark:border-white/10 flex items-center gap-2.5 bg-white/30 dark:bg-black/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-purple-900 dark:text-purple-100">✨ Today's Insight</p>
          <p className="text-xs text-purple-700/70 dark:text-purple-300/70 font-medium tracking-wide">Powered by Gemini</p>
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="space-y-2.5">
            {[100, 90, 75].map((w) => (
              <div key={w} className="skeleton h-4 rounded bg-purple-200/50 dark:bg-purple-800/50" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : insight ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium"
          >
            {insight}
          </motion.p>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            “You’ve had a solid start this week. You’re building consistency.” <br/><br/>
            <span className="text-xs font-normal opacity-70">Log more moods to unlock personalised deep insights.</span>
          </p>
        )}
      </div>
    </div>
  )
}
