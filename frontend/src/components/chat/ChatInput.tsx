import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useVoice } from '@/hooks/useVoice'
import VoiceButton from '@/components/common/VoiceButton'

interface ChatInputProps {
  isConnected: boolean
  onSend: (text: string) => void
}

export default function ChatInput({ isConnected, onSend }: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: (text) => setInput(text),
  })

  function handleSend() {
    const text = input.trim()
    if (!text || !isConnected) return
    onSend(text)
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
      <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-1.5 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-400 transition-all shadow-sm">
        <div className="pb-1 pl-1">
          <VoiceButton
            isRecording={isRecording}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            size="sm"
          />
        </div>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Tell me what’s on your mind… I’m listening 💜"
          rows={1}
          className="resize-none flex-1 max-h-32 py-3 px-2 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
          className="btn-primary flex-shrink-0 py-2.5 px-3.5 rounded-2xl h-10 w-10 flex items-center justify-center p-0 mb-0.5 mr-0.5"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-2.5">
        EchoMind is an AI companion, not a licensed therapist.
      </p>
    </div>
  )
}
