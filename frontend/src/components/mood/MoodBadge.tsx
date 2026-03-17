import { motion } from 'framer-motion'
import type { MoodLabel } from '@/types'

interface Props {
  mood: MoodLabel
  size?: 'xs' | 'sm' | 'md'
}

const MOOD_CONFIG: Record<MoodLabel, { emoji: string; label: string; pill: string; glow: string }> = {
  happy:    { emoji: '😊', label: 'Happy',    pill: 'mood-pill-happy',    glow: 'shadow-glow-happy' },
  sad:      { emoji: '😢', label: 'Sad',      pill: 'mood-pill-sad',      glow: 'shadow-glow-sad' },
  stressed: { emoji: '😰', label: 'Stressed', pill: 'mood-pill-stressed', glow: 'shadow-glow-stressed' },
  relaxed:  { emoji: '😌', label: 'Relaxed',  pill: 'mood-pill-relaxed',  glow: 'shadow-glow-relaxed' },
  neutral:  { emoji: '😐', label: 'Neutral',  pill: 'mood-pill-neutral',  glow: '' },
}

const SIZE = {
  xs: 'text-[10px] px-2 py-0.5 gap-0.5',
  sm: 'text-xs px-2.5 py-1 gap-1',
  md: 'text-sm px-3 py-1.5 gap-1.5',
}

export default function MoodBadge({ mood, size = 'sm' }: Props) {
  const cfg = MOOD_CONFIG[mood]
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full font-semibold ${cfg.pill} ${SIZE[size]}`}
    >
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </motion.span>
  )
}
