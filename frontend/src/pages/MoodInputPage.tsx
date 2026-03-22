/**
 * MoodInputPage — Flocus-inspired immersive check-in experience.
 *
 * Design principles:
 *  - Full-screen canvas (handled by ImmersiveLayout)
 *  - Single floating GlassCard as the focal point
 *  - One thing at a time — no distractions
 *  - Response presented as a second floating card
 *  - Ambient mode accessible after result
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RotateCcw, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassCard from '@/components/common/GlassCard'
import AmbientMode from '@/components/common/AmbientMode'
import VoiceButton from '@/components/common/VoiceButton'
import { useVoice } from '@/hooks/useVoice'
import { chatApi, musicApi } from '@/api/client'
import { useUIStore } from '@/store/uiStore'
import type { MoodLabel } from '@/types'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────
type Phase = 'pick' | 'elaborate' | 'result'

interface MoodMeta {
  emoji: string
  label: string
  desc: string
  ring: string
  glow: string
}

interface Result {
  mood: MoodLabel
  reply: string
  quote: string
  musicEmbed?: string
}

// ─── Mood metadata ─────────────────────────────────────────
const MOODS: Record<MoodLabel, MoodMeta> = {
  happy:   { emoji: '😊', label: 'Happy',   desc: 'Joyful & bright',      ring: 'ring-amber-300/60',   glow: 'shadow-amber-400/40' },
  relaxed: { emoji: '😌', label: 'Relaxed', desc: 'Calm & at peace',      ring: 'ring-emerald-300/60', glow: 'shadow-emerald-400/40' },
  neutral: { emoji: '😐', label: 'Neutral', desc: 'Just okay',            ring: 'ring-slate-300/60',   glow: 'shadow-slate-400/40' },
  sad:     { emoji: '😢', label: 'Sad',     desc: 'Down or low',          ring: 'ring-blue-300/60',    glow: 'shadow-blue-400/40' },
  stressed:{ emoji: '😰', label: 'Stressed',desc: 'Overwhelmed or tense', ring: 'ring-rose-300/60',    glow: 'shadow-rose-400/40' },
}

const QUOTES: Record<MoodLabel, string> = {
  happy:    '"Happiness is not something ready-made. It comes from your own actions." — Dalai Lama',
  relaxed:  '"Within you there is a stillness and sanctuary to which you can retreat at any time." — Hermann Hesse',
  neutral:  '"Balance is not something you find, it\'s something you create." — Jana Kingsford',
  sad:      '"Even the darkest night will end and the sun will rise." — Victor Hugo',
  stressed: '"You don\'t have to control your thoughts. You just have to stop letting them control you." — Dan Millman',
}

const PAGE_V = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0  },
  exit:     { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

// ─── Component ─────────────────────────────────────────────
export default function MoodInputPage() {
  const [phase, setPhase]       = useState<Phase>('pick')
  const [mood, setMood]         = useState<MoodLabel | null>(null)
  const [message, setMessage]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<Result | null>(null)
  const [ambient, setAmbient]   = useState(false)

  const { setCurrentMood } = useUIStore()

  const { isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: (t) => setMessage(t),
  })

  // ── Handlers ─────────────────────────────────────────────
  function pickMood(m: MoodLabel) {
    setMood(m)
    setCurrentMood(m)
    // Small delay so the selection animation completes before transitioning
    setTimeout(() => setPhase('elaborate'), 350)
  }

  async function submit() {
    if (!mood) return
    setLoading(true)
    try {
      const input = message.trim() || `I'm feeling ${mood} today`
      const [chatRes, musicRes] = await Promise.allSettled([
        chatApi.sendMessage(input),
        musicApi.playlist(mood),
      ])
      setResult({
        mood,
        quote:      QUOTES[mood],
        reply:      chatRes.status === 'fulfilled' ? chatRes.value.reply : '',
        musicEmbed: musicRes.status === 'fulfilled' ? musicRes.value.embed_url : undefined,
      })
      setPhase('result')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setPhase('pick')
    setMood(null)
    setMessage('')
    setResult(null)
  }

  const meta = mood ? MOODS[mood] : null

  return (
    <>
      {/* ── Ambient mode overlay ── */}
      <AnimatePresence>
        {ambient && result && (
          <AmbientMode
            mood={result.mood}
            musicEmbed={result.musicEmbed}
            onClose={() => setAmbient(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Steps dot indicator ── */}
      <div className="flex items-center gap-2 mb-10">
        {(['pick','elaborate','result'] as Phase[]).map((p, i) => (
          <div key={p} className={`rounded-full transition-all duration-300
            ${phase === p
              ? 'w-6 h-2 bg-white'
              : i < (['pick','elaborate','result'] as Phase[]).indexOf(phase)
                ? 'w-2 h-2 bg-white/60'
                : 'w-2 h-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* ── Phase content ── */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* ══ Phase 1: Pick mood ══ */}
          {phase === 'pick' && (
            <motion.div key="pick" {...PAGE_V} className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  How are you really feeling right now?
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  Take a breath and tap the vibe that fits best
                </p>
              </div>

              <GlassCard padding="md" full>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.entries(MOODS) as [MoodLabel, MoodMeta][]).map(([key, m]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => pickMood(key)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl
                        bg-white/5 hover:bg-white/15
                        border border-white/10 hover:border-white/30
                        transition-all duration-150 group
                        ${mood === key ? `ring-2 ${m.ring} bg-white/15 shadow-lg ${m.glow}` : ''}`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[10px] text-white/70 font-medium leading-tight text-center">
                        {m.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>

              <p className="text-center text-white/30 text-xs">
                Just between you and AI ✨
              </p>
            </motion.div>
          )}

          {/* ══ Phase 2: Elaborate ══ */}
          {phase === 'elaborate' && mood && (
            <motion.div key="elaborate" {...PAGE_V} className="space-y-5">
              <div className="text-center space-y-1.5">
                <span className="text-5xl">{meta?.emoji}</span>
                <h2 className="text-2xl font-bold text-white mt-2">
                  {meta?.label} vibes
                </h2>
                <p className="text-white/60 text-sm">{meta?.desc}</p>
              </div>

              <GlassCard padding="md" full>
                <p className="text-white/70 text-xs font-medium mb-2.5">
                  Want to unpack that? <span className="text-white/40">(totally optional)</span>
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) submit() }}
                  placeholder={`What's on your mind? Spill as much or as little as you want...`}
                  rows={4}
                  autoFocus
                  className="w-full bg-white/5 border border-white/15 rounded-xl
                    px-4 py-3 text-sm text-white placeholder-white/30
                    focus:outline-none focus:border-white/40 focus:bg-white/10
                    resize-none transition-all duration-150"
                />

                <div className="flex items-center gap-3 mt-3">
                  <VoiceButton
                    isRecording={isRecording}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    size="sm"
                  />
                  <span className="text-white/40 text-xs flex-1">
                    {isRecording ? 'Listening…' : 'Hold to vent · ⌘↵ to submit'}
                  </span>
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                      bg-white/20 hover:bg-white/30 border border-white/25
                      text-white text-sm font-semibold
                      disabled:opacity-50 transition-all duration-150"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Explore insights</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </div>
              </GlassCard>

              <button
                onClick={() => setPhase('pick')}
                className="mx-auto block text-white/40 hover:text-white/70
                  text-xs transition-colors duration-150"
              >
                ← Wait, change vibe
              </button>
            </motion.div>
          )}

          {/* ══ Phase 3: Result ══ */}
          {phase === 'result' && result && (
            <motion.div key="result" {...PAGE_V} className="space-y-4 w-full max-w-md">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-white">Here's something for you</h2>
                <p className="text-white/50 text-sm">Curated for your current energy</p>
              </div>

              {/* AI reply */}
              {result.reply && (
                <GlassCard padding="md" full>
                  <p className="text-white/90 text-sm leading-7">{result.reply}</p>
                </GlassCard>
              )}

              {/* Quote */}
              <GlassCard padding="sm" full>
                <p className="text-white/60 text-xs italic leading-relaxed border-l-2 border-white/20 pl-3">
                  {result.quote}
                </p>
              </GlassCard>

              {/* Music embed */}
              {result.musicEmbed && (
                <GlassCard padding="sm" full className="overflow-hidden !p-0">
                  <iframe
                    src={result.musicEmbed}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen"
                    loading="lazy"
                    className="rounded-2xl"
                    title="Recommended playlist"
                  />
                </GlassCard>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setAmbient(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                    bg-white/10 hover:bg-white/20 border border-white/15
                    text-white/80 text-xs font-medium transition-all duration-150"
                >
                  <Wind className="w-3.5 h-3.5" /> Ambient
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                    bg-white/10 hover:bg-white/20 border border-white/15
                    text-white/80 text-xs font-medium transition-all duration-150"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Again
                </button>
                <Link
                  to="/chat"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                    bg-white/20 hover:bg-white/30 border border-white/25
                    text-white text-xs font-semibold transition-all duration-150"
                >
                  Continue in Chat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
