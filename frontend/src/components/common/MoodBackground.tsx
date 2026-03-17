/**
 * MoodBackground – full-screen animated gradient that shifts based on mood.
 * Designed as a fixed layer sitting behind all content.
 * Uses CSS custom properties + transitions — zero JS animation loop.
 */
import type { MoodLabel } from '@/types'

interface Props { mood: MoodLabel | null }

// Each mood has a rich 3-stop CSS gradient
const GRADIENTS: Record<MoodLabel, string> = {
  happy:    'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #f97316 100%)',
  sad:      'linear-gradient(135deg, #1e3a5f 0%, #3b62a0 50%, #64748b 100%)',
  stressed: 'linear-gradient(135deg, #7f1d1d 0%, #be123c 50%, #6d28d9 100%)',
  relaxed:  'linear-gradient(135deg, #064e3b 0%, #0d9488 50%, #0891b2 100%)',
  neutral:  'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
}

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #1e1b4b 100%)'

// Subtle noise overlay makes the gradient feel more premium (same SVG trick Flocus uses)
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`

export default function MoodBackground({ mood }: Props) {
  const gradient = mood ? GRADIENTS[mood] : DEFAULT_GRADIENT

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      {/* Main gradient – CSS transition handles mood change */}
      <div
        className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
        style={{ background: gradient }}
      />

      {/* Noise texture overlay – gives depth without images */}
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: NOISE_SVG }}
      />

      {/* Vignette – darkens edges for focus on center content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  )
}
