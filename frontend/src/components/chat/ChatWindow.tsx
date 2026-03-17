import { useRef, useEffect, useState } from 'react'
import { Send, Mic, MicOff, Volume2, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/useChat'
import { useVoice } from '@/hooks/useVoice'
import { getMoodConfig } from '@/lib/moodUtils'
import { ttsApi } from '@/api/client'
import MoodBadge from '@/components/mood/MoodBadge'
import toast from 'react-hot-toast'

export default function ChatWindow() {
  const { messages, isTyping, isConnected, sendMessage, clearMessages } = useChat()
  const [input, setInput] = useState('')
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: (text) => setInput(text),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend() {
    const text = input.trim()
    if (!text) return
    sendMessage(text)
    setInput('')
  }

  async function playTTS(messageId: string, text: string) {
    setLoadingAudio(messageId)
    try {
      const { audio_url } = await ttsApi.generate(text)
      const audio = new Audio(audio_url)
      audio.play()
    } catch {
      toast.error('Could not generate voice response.')
    } finally {
      setLoadingAudio(null)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)] card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-lg">
            🧠
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">EchoMind</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
              {isConnected ? 'Connected' : 'Reconnecting…'}
            </p>
          </div>
        </div>
        <button
          onClick={clearMessages}
          className="btn-ghost text-xs py-1.5 px-3"
          title="New conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="text-5xl">💬</div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">How are you feeling today?</p>
              <p className="text-sm text-gray-400 mt-1">Share your thoughts — I'm here to listen.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['I feel happy today!', 'I\'m stressed about work', 'Feeling a bit low', 'I\'m calm and relaxed'].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-600
                    dark:text-brand-400 rounded-full border border-brand-200 dark:border-brand-700
                    hover:bg-brand-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${msg.role === 'user'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gradient-to-br from-brand-400 to-purple-500 text-white'
                }`}
              >
                {msg.role === 'user' ? '👤' : '🧠'}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>

                <div className="flex items-center gap-2 px-1">
                  {msg.mood && <MoodBadge mood={msg.mood} size="xs" />}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => playTTS(msg.id, msg.content)}
                      disabled={loadingAudio === msg.id}
                      className="text-gray-400 hover:text-brand-500 transition-colors disabled:opacity-50"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-sm">🧠</div>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`flex-shrink-0 p-2.5 rounded-xl transition-colors
              ${isRecording
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            title={isRecording ? 'Recording…' : 'Hold to record'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Type a message or hold mic to speak…"
            rows={1}
            className="input resize-none flex-1 py-2.5 max-h-32"
            style={{ height: 'auto' }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || !isConnected}
            className="btn-primary flex-shrink-0 py-2.5 px-3"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          EchoMind is an AI wellness companion, not a mental health professional.
        </p>
      </div>
    </div>
  )
}
