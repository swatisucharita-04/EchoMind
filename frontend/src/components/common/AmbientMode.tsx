/**
 * AmbientMode – a full-screen calm overlay.
 * Features:
 *  - Breathing circle animation (4-7-8 technique adapted: 4s in, 2s hold, 6s out)
 *  - Mood-aware colour
 *  - Embedded Spotify playlist (optional)
 *  - Dismiss with Escape or click the × button
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music } from 'lucide-react'
import type { MoodLabel } from '@/types'

interface Props {
  mood: MoodLabel | null
  musicEmbed?: string
  onClose: () => void
}

const MOOD_CIRCLE: Record<MoodLabel, string> = {
  happy:    'from-amber-300/40 to-rose-400/40',
  sad:      'from-blue-400/30 to-indigo-500/30',
  stressed: 'from-rose-400/30 to-violet-500/30',
  relaxed:  'from-emerald-300/30 to-teal-400/30',
  neutral:  'from-slate-300/20 to-slate-400/20',
}
const DEFAULT_CIRCLE = 'from-violet-400/30 to-indigo-500/30'

// Breathing phases: inhale → hold → exhale (in seconds)
const PHASES: { label: string; scale: number; duration: number }[] = [
  { label: 'Breathe in',  scale: 1.4,  duration: 4 },
  { label: 'Hold',        scale: 1.4,  duration: 2 },
  { label: 'Breathe out', scale: 1.0,  duration: 6 },
]

export default function AmbientMode({ mood, musicEmbed, onClose }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [showMusic, setShowMusic] = useState(false)

  const phase = PHASES[phaseIdx]
  const circleGrad = mood ? MOOD_CIRCLE[mood] : DEFAULT_CIRCLE

  // Advance phase after each duration
  useEffect(() => {
    const t = setTimeout(() => {
      setPhaseIdx((i) => (i + 1) % PHASES.length)
    }, phase.duration * 1000)
    return () => clearTimeout(t)
  }, [phaseIdx, phase.duration])

  // Dismiss on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-black/60 backdrop-blur-sm"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full
          bg-white/10 hover:bg-white/20 border border-white/20
          flex items-center justify-center text-white/70 hover:text-white
          transition-colors duration-150"
        aria-label="Exit ambient mode"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Music toggle */}
      {musicEmbed && (
        <button
          onClick={() => setShowMusic((s) => !s)}
          className="absolute top-6 left-6 w-10 h-10 rounded-full
            bg-white/10 hover:bg-white/20 border border-white/20
            flex items-center justify-center text-white/70 hover:text-white
            transition-colors duration-150"
          aria-label="Toggle music player"
        >
          <Music className="w-4 h-4" />
        </button>
      )}

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <motion.div
          animate={{ scale: phase.scale, opacity: [0.3, 0.15] }}
          transition={{ duration: phase.duration, ease: 'easeInOut' }}
          className={`absolute w-72 h-72 rounded-full bg-gradient-to-br ${circleGrad}`}
        />
        {/* Main circle */}
        <motion.div
          animate={{ scale: phase.scale }}
          transition={{ duration: phase.duration, ease: 'easeInOut' }}
          className={`w-52 h-52 rounded-full bg-gradient-to-br ${circleGrad}
            border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.15)]
            flex items-center justify-center`}
        >
          <div className="text-center">
            <p className="text-white/90 text-sm font-medium tracking-wide">
              {phase.label}
            </p>
            <p className="text-white/50 text-xs mt-1">{phase.duration}s</p>
          </div>
        </motion.div>
      </div>

      {/* Phase label below circle */}
      <motion.p
        key={phaseIdx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/50 text-xs mt-10 tracking-widest uppercase"
      >
        Follow the circle
      </motion.p>

      {/* Embedded music player (collapsible) */}
      <AnimatePresence>
        {showMusic && musicEmbed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10
              shadow-[0_8px_32px_rgba(0,0,0,0.4)] bg-black/30 backdrop-blur-xl">
              <iframe
                src={musicEmbed}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen"
                loading="lazy"
                title="Ambient music"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
