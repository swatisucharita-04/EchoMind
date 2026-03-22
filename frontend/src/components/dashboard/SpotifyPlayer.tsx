import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { musicApi } from '@/api/client'
import { Music, ExternalLink, RefreshCw } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { motion } from 'framer-motion'

export default function SpotifyPlayer() {
  const { currentMood } = useUIStore()
  const mood = currentMood ?? 'neutral'

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['music', mood],
    queryFn: () => musicApi.playlist(mood),
    staleTime: 1000 * 60 * 30,
    enabled: !!mood,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 dark:border-white/5 bg-gradient-to-r from-emerald-500/10 to-brand-500/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center ">
            <Music className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Mood Playlist</p>
            <p className="text-[10px] text-gray-500 capitalize">{mood} vibes</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/20 transition-colors"
            title="Refresh playlist"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          {data?.embed_url && (
            <a
              href={data.embed_url.replace('/embed/', '/')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Embed */}
      <div className="p-3">
        {isLoading ? (
          <div className="skeleton h-24 rounded-xl" />
        ) : data?.embed_url ? (
          <iframe
            src={data.embed_url}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Music className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            <p className="text-xs text-gray-400">No playlist available</p>
            <button onClick={() => refetch()} className="btn-outline text-xs py-1.5 px-3 mt-1">
              Try again
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
