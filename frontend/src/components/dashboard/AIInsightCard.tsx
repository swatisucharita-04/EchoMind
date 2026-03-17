import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Props {
  insight: string
  isLoading?: boolean
}

export default function AIInsightCard({ insight, isLoading = false }: Props) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Gradient header */}
      <div className="px-5 py-4 bg-gradient-to-r from-brand-500/10 via-violet-500/10 to-transparent border-b border-white/20 dark:border-white/10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Weekly Insight</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini</p>
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="space-y-2.5">
            {[100, 90, 75].map((w) => (
              <div key={w} className="skeleton h-4 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : insight ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            {insight}
          </motion.p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Start chatting or journaling to receive your personalised insight.
          </p>
        )}
      </div>
    </div>
  )
}
