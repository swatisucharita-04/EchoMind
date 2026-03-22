import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { Plus, Trash2, Sparkles, Edit3, X, Check } from 'lucide-react'
import { journalApi } from '@/api/client'
import type { JournalEntry } from '@/types'
import MoodBadge from '@/components/mood/MoodBadge'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

function WordCount({ count }: { count: number }) {
  return <span className="text-xs text-gray-400">{count} words</span>
}

export default function JournalPage() {
  const qc = useQueryClient()
  const [showCompose, setShowCompose] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [insight, setInsight] = useState<{ id: number; text: string } | null>(null)

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal'],
    queryFn: () => journalApi.list(50),
  })

  const createMutation = useMutation({
    mutationFn: journalApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal'] })
      qc.invalidateQueries({ queryKey: ['analytics-dashboard'] })
      toast.success('Entry saved!')
      resetCompose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => journalApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal'] })
      toast.success('Entry updated!')
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: journalApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal'] })
      toast.success('Entry deleted')
    },
  })

  const insightMutation = useMutation({
    mutationFn: journalApi.insight,
    onSuccess: (data, id) => setInsight({ id, text: data.insight }),
  })

  function resetCompose() {
    setShowCompose(false)
    setTitle('')
    setContent('')
  }

  function handleCreate() {
    if (!content.trim()) return
    createMutation.mutate({ title: title || undefined, content })
  }

  function startEdit(entry: JournalEntry) {
    setEditing(entry)
    setTitle(entry.title ?? '')
    setContent(entry.content)
  }

  function handleUpdate() {
    if (!editing || !content.trim()) return
    updateMutation.mutate({ id: editing.id, data: { title: title || undefined, content } })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Journal</h1>
          <p className="text-sm text-gray-500 mt-0.5">{entries.length} entries • AI mood analysis on every save</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Compose / Edit panel */}
      <AnimatePresence>
        {(showCompose || editing) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {editing ? 'Edit Entry' : 'New Entry'}
              </h3>
              <button
                onClick={() => { resetCompose(); setEditing(null) }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="input"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here…"
              rows={6}
              className="input resize-none"
            />

            <div className="flex items-center justify-between">
              <WordCount count={content.trim().split(/\s+/).filter(Boolean).length} />
              <div className="flex gap-2">
                <button
                  onClick={() => { resetCompose(); setEditing(null) }}
                  className="btn-ghost text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={editing ? handleUpdate : handleCreate}
                  disabled={!content.trim() || createMutation.isPending || updateMutation.isPending}
                  className="btn-primary text-sm py-2 px-4"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editing ? 'Save Changes' : 'Save Entry'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insight modal */}
      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-5 border-l-4 border-violet-400 bg-violet-50/80 dark:bg-violet-900/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.text}</p>
              </div>
              <button onClick={() => setInsight(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="skeleton h-4 rounded w-1/3" />
              <div className="skeleton h-3 rounded w-full" />
              <div className="skeleton h-3 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-14 text-center max-w-sm mx-auto relative overflow-hidden group hover:shadow-glass-hover transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-violet-500/5 blur-xl group-hover:from-brand-500/10 group-hover:to-violet-500/10 transition-colors duration-500" />
          <div className="text-4xl mb-4 relative z-10 transition-transform duration-300 group-hover:-translate-y-1">✍️</div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 relative z-10 text-lg">Your thoughts deserve a space.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 relative z-10">Start your first entry — even one line is enough.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              className="glass-card p-5 hover:shadow-glass-dark transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {entry.title && (
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{entry.title}</h4>
                    )}
                    {entry.mood && <MoodBadge mood={entry.mood} size="xs" />}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-400">
                      {format(parseISO(entry.created_at), 'MMM d, yyyy · h:mm a')}
                    </span>
                    <WordCount count={entry.word_count} />
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => insightMutation.mutate(entry.id)}
                    disabled={insightMutation.isPending}
                    className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                    title="Get AI insight"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startEdit(entry)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this entry?')) deleteMutation.mutate(entry.id)
                    }}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
