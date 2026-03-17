import type { MoodLabel } from '@/types'

export const MOOD_CONFIG: Record<MoodLabel, {
  label: string
  emoji: string
  color: string
  bg: string
  border: string
  score: number
}> = {
  happy:   { label: 'Happy',   emoji: '😊', color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-300', score: 9 },
  relaxed: { label: 'Relaxed', emoji: '😌', color: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-300',  score: 7 },
  neutral: { label: 'Neutral', emoji: '😐', color: 'text-gray-600',   bg: 'bg-gray-50',    border: 'border-gray-300',   score: 5 },
  stressed:{ label: 'Stressed',emoji: '😰', color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-300',    score: 3 },
  sad:     { label: 'Sad',     emoji: '😔', color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-300',   score: 2 },
}

export const MOOD_CHART_COLORS: Record<MoodLabel, string> = {
  happy:   '#FFC107',
  relaxed: '#27AE60',
  neutral: '#95A5A6',
  stressed:'#E74C3C',
  sad:     '#5B9BD5',
}

export function getMoodConfig(mood: MoodLabel | string | null | undefined) {
  return MOOD_CONFIG[(mood as MoodLabel) ?? 'neutral'] ?? MOOD_CONFIG.neutral
}

export function scoreToMood(score: number): MoodLabel {
  if (score >= 8) return 'happy'
  if (score >= 6) return 'relaxed'
  if (score >= 4) return 'neutral'
  if (score >= 2) return 'stressed'
  return 'sad'
}
