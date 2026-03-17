/**
 * MoodResponseCard – clean, calm result card.
 * No staggered x-animations (distracting). Simple fade-in only.
 */
import { useState } from 'react'
import { Volume2, Music, Quote, Loader2 } from 'lucide-react'
import { ttsApi } from '@/api/client'
import MoodBadge from '@/components/mood/MoodBadge'
import type { MoodLabel } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  mood: MoodLabel
  quote: string
  musicEmbed?: string
  reply?: string
  onReset?: () => void
}

export default function MoodResponseCard({ mood, quote, musicEmbed, reply, onReset }: Props) {
  const [playing,  setPlaying]  = useState(false)
  const [played,   setPlayed]   = useState(false)

  async function handleTTS() {
    if (!reply) return
    setPlaying(true)
    try {
      const { audio_url } = await ttsApi.generate(reply)
      const audio = new Audio(audio_url)
      audio.onended = () => { setPlaying(false); setPlayed(true) }
      audio.play()
    } catch {
      toast.error('Could not generate voice response.')
      setPlaying(false)
    }
  }

  return (
    <div className="space-y-3 animate-fade-in">

      {/* Mood confirmed row */}
      <div className="flex items-center justify-between px-4 py-3 card">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Mood detected</span>
          <MoodBadge mood={mood} size="sm" />
        </div>
        {onReset && (
          <button onClick={onReset} className="text-xs text-gray-400 hover:text-brand-600 transition-colors">
            Start over
          </button>
        )}
      </div>

      {/* AI reply */}
      {reply && (
        <div className="card p-5 space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-7">{reply}</p>
          <button
            onClick={handleTTS}
            disabled={playing}
            className="btn-secondary text-xs gap-1.5 py-1.5 px-3"
          >
            {playing
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Volume2 className="w-3.5 h-3.5" />
            }
            {playing ? 'Playing…' : played ? 'Replay' : 'Listen'}
          </button>
        </div>
      )}

      {/* Quote */}
      {quote && (
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <Quote className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-7 italic">{quote}</p>
          </div>
        </div>
      )}

      {/* Music embed */}
      {musicEmbed && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <Music className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Recommended playlist</p>
          </div>
          <div className="p-3">
            <iframe
              src={musicEmbed}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
              title="Spotify playlist"
            />
          </div>
        </div>
      )}
    </div>
  )
}
