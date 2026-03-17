import { useRef, useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/useChat'
import { useVoice } from '@/hooks/useVoice'
import { ttsApi } from '@/api/client'
import MoodBadge from '@/components/mood/MoodBadge'
import VoiceButton from '@/components/common/VoiceButton'
import SpotifyPlayer from '@/components/dashboard/SpotifyPlayer'
import { Volume2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// Suggestion chips — short, real, not generic
const SUGGESTIONS = [
  "I'm feeling really stressed right now",
  "Today was a good day 😊",
  "I've been feeling anxious lately",
  "I need some motivation",
  "I can't stop overthinking",
  "I feel calm and grateful today",
]

export default function ChatPage() {
  const { messages, isTyping, isConnected, sendMessage, clearMessages } = useChat()
  const [input, setInput] = useState('')
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const { isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: (text) => setInput(text),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend() {
    const text = input.trim()
    if (!text || !isConnected) return
    sendMessage(text)
    setInput('')
    inputRef.current?.focus()
  }

  function handleChip(text: string) {
    sendMessage(text)
    inputRef.current?.focus()
  }

  async function playTTS(messageId: string, text: string) {
    setLoadingAudio(messageId)
    try {
      const { audio_url } = await ttsApi.generate(text)
      new Audio(audio_url).play()
    } catch {
      toast.error('Could not generate voice response.')
    } finally {
      setLoadingAudio(null)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex gap-5 h-[calc(100vh-3.5rem)] pb-5">

      {/* ── Chat Panel ── */}
      <div className="flex-1 min-w-0 flex flex-col card overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-base flex-shrink-0">
              🧠
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">EchoMind</p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isConnected ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                {isConnected ? 'Connected' : 'Reconnecting…'}
              </p>
            </div>
          </div>
          <button
            onClick={clearMessages}
            className="btn-ghost text-xs py-1.5 px-2.5 gap-1.5"
            title="New conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* Welcome / empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center pb-8">
              <div>
                <p className="text-2xl mb-2">💬</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  What's on your mind?
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">
                  Share how you're feeling and EchoMind will respond with support, insights, and suggestions.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleChip(s)}
                    className="px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700
                      text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800
                      hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400
                      transition-colors duration-150"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm
                  ${msg.role === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-base'
                  }`}
                >
                  {msg.role === 'user' ? '👤' : '🧠'}
                </div>

                {/* Bubble */}
                <div className={`max-w-[76%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Meta row */}
                  <div className={`flex items-center gap-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.mood && <MoodBadge mood={msg.mood} size="xs" />}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => playTTS(msg.id, msg.content)}
                        disabled={loadingAudio === msg.id}
                        className="text-gray-300 hover:text-brand-500 transition-colors"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm flex-shrink-0">🧠</div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700">
                <div className="flex gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-3.5 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-end gap-2">
            <VoiceButton
              isRecording={isRecording}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              size="sm"
            />
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
              }}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="input resize-none flex-1 max-h-32 py-2.5"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !isConnected}
              className="btn-primary flex-shrink-0 py-2.5 px-3.5 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            EchoMind is an AI companion, not a licensed therapist.
          </p>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-4">
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tips</p>
          <ul className="space-y-2.5">
            {[
              'Share how you\'re really feeling',
              'Hold mic to speak instead of type',
              'Tap 🔊 on replies to hear them',
              'Try the mood check-in for a guided flow',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-brand-400 mt-px">·</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <SpotifyPlayer />
      </div>
    </div>
  )
}
