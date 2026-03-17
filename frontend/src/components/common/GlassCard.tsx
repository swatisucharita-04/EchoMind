/**
 * GlassCard – the core reusable primitive for the Flocus-inspired UI.
 * Floating frosted glass panel that works on any coloured / image background.
 */
import { type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

interface Props extends HTMLMotionProps<'div'> {
  children: ReactNode
  /** Extra padding size: sm=p-4, md=p-6 (default), lg=p-8 */
  padding?: 'sm' | 'md' | 'lg'
  /** Fill the parent's width */
  full?: boolean
  /** Enable hover lift — good for clickable cards */
  hoverable?: boolean
  className?: string
}

const PAD = { sm: 'p-4', md: 'p-6', lg: 'p-8' }

export default function GlassCard({
  children,
  padding = 'md',
  full = false,
  hoverable = false,
  className = '',
  ...motionProps
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={hoverable ? { y: -3, transition: { duration: 0.15 } } : undefined}
      className={[
        // Core glass look
        'rounded-2xl',
        'bg-white/10 dark:bg-black/20',
        'backdrop-blur-xl',
        'border border-white/20 dark:border-white/10',
        'shadow-[0_8px_32px_rgba(0,0,0,0.18)]',
        // Padding
        PAD[padding],
        // Width
        full ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}
