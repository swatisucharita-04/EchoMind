/**
 * AnimatedBackground – subtle, calm, CSS-only gradient orbs.
 * Pure CSS transitions, no heavy JS animation loop.
 * Mood colour changes via CSS custom properties.
 */
import type { MoodLabel } from '@/types'

interface Props { mood: MoodLabel | null }

const MOOD_VARS: Record<MoodLabel, { a: string; b: string }> = {
  happy:    { a: 'rgba(251,191,36,0.18)',  b: 'rgba(249,115,22,0.12)' },
  sad:      { a: 'rgba(96,165,250,0.18)',  b: 'rgba(129,140,248,0.12)' },
  stressed: { a: 'rgba(248,113,113,0.16)', b: 'rgba(251,113,133,0.10)' },
  relaxed:  { a: 'rgba(52,211,153,0.18)',  b: 'rgba(110,231,183,0.10)' },
  neutral:  { a: 'rgba(148,163,184,0.14)', b: 'rgba(165,180,252,0.10)' },
}
const DEFAULT = { a: 'rgba(99,102,241,0.12)', b: 'rgba(167,139,250,0.08)' }

export default function AnimatedBackground({ mood }: Props) {
  const { a, b } = mood ? MOOD_VARS[mood] : DEFAULT

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Top-left orb */}
      <div
        className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full blur-3xl
                   transition-all duration-[3000ms] ease-in-out orb-float"
        style={{ background: a }}
      />
      {/* Bottom-right orb */}
      <div
        className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full blur-3xl
                   transition-all duration-[3000ms] ease-in-out orb-float-slow"
        style={{ background: b }}
      />
    </div>
  )
}
