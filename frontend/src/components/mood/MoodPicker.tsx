import { motion } from 'framer-motion'
import type { MoodLabel } from '@/types'
import { useUIStore } from '@/store/uiStore'

type MoodOption = {
  mood: MoodLabel
  emoji: string
  label: string
  description: string
  gradient: string
  ring: string
  bg: string
}

const MOODS: MoodOption[] = [
  {
    mood: 'happy',
    emoji: '😊',
    label: 'Happy',
    description: 'Joyful & positive',
    gradient: 'from-amber-400 to-orange-400',
    ring: 'ring-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    mood: 'relaxed',
    emoji: '😌',
    label: 'Relaxed',
    description: 'Calm & at ease',
    gradient: 'from-emerald-400 to-teal-400',
    ring: 'ring-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    mood: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    description: 'Just okay',
    gradient: 'from-slate-400 to-gray-400',
    ring: 'ring-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-800/40',
  },
  {
    mood: 'sad',
    emoji: '😢',
    label: 'Sad',
    description: 'Feeling low',
    gradient: 'from-blue-400 to-indigo-400',
    ring: 'ring-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    mood: 'stressed',
    emoji: '😰',
    label: 'Stressed',
    description: 'Anxious / overwhelmed',
    gradient: 'from-red-400 to-rose-400',
    ring: 'ring-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
]

interface Props {
  selected: MoodLabel | null
  onSelect: (mood: MoodLabel) => void
}

export default function MoodPicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {MOODS.map((m, i) => {
        const isSelected = selected === m.mood
        return (
          <motion.button
            key={m.mood}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(m.mood)}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer
              ${isSelected
                ? `${m.bg} ${m.ring} ring-2 border-transparent shadow-lg`
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
              }
            `}
          >
            <motion.span
              animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className="text-4xl leading-none select-none"
            >
              {m.emoji}
            </motion.span>
            <div className="text-center">
              <p className={`text-xs font-semibold ${isSelected ? 'text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>
                {m.label}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block mt-0.5">
                {m.description}
              </p>
            </div>
            {isSelected && (
              <motion.div
                layoutId="mood-selector"
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.gradient} opacity-10`}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
