import { useState, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  isRecording: boolean
  onMouseDown: () => void
  onMouseUp: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function VoiceButton({
  isRecording,
  onMouseDown,
  onMouseUp,
  size = 'md',
  className = '',
}: Props) {
  const sizeClasses = {
    sm:  'w-10 h-10',
    md:  'w-12 h-12',
    lg:  'w-16 h-16',
  }
  const iconSize = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Pulsing rings when recording */}
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`absolute ${sizeClasses[size]} rounded-full bg-red-400`}
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.15 }}
              className={`absolute ${sizeClasses[size]} rounded-full bg-red-300`}
            />
          </>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchEnd={onMouseUp}
        className={`relative z-10 ${sizeClasses[size]} rounded-full flex items-center justify-center
          transition-all duration-200 ${
          isRecording
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-brand-500'
        }`}
        title={isRecording ? 'Recording… release to stop' : 'Hold to record'}
      >
        <motion.div
          key={isRecording ? 'off' : 'on'}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {isRecording
            ? <MicOff className={iconSize[size]} />
            : <Mic className={iconSize[size]} />
          }
        </motion.div>
      </motion.button>
    </div>
  )
}
