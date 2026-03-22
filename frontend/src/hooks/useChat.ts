import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
// crypto.randomUUID is available in all modern browsers

import type { ChatMessage, MoodLabel, WSServerMessage } from '@/types'
import { useUIStore } from '@/store/uiStore'
import toast from 'react-hot-toast'

const WS_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/^http/, 'ws') ?? ''

function makeLocalId() {
  return Math.random().toString(36).slice(2)
}

export function useChat(sessionId?: string) {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState(sessionId ?? makeLocalId())
  const initialSessionIdRef = useRef(activeSessionId)
  const wsRef = useRef<WebSocket | null>(null)
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const setCurrentMood = useUIStore((s) => s.setCurrentMood)
  const isConnectingRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) return
    isConnectingRef.current = true

    const token = await getToken()
    if (!token) {
      isConnectingRef.current = false
      return
    }

    const ws = new WebSocket(
      `${WS_BASE}/api/v1/chat/ws/${initialSessionIdRef.current}?token=${token}`
    )
    wsRef.current = ws

    ws.onopen = () => {
      isConnectingRef.current = false
      setIsConnected(true)
      // Keepalive ping every 25s
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('__ping__')
      }, 25_000)
    }

    ws.onmessage = (event) => {
      if (event.data === '__pong__') return

      try {
        const msg: WSServerMessage = JSON.parse(event.data)

        if (msg.type === 'typing') {
          setIsTyping(true)
          return
        }

        if (msg.type === 'error') {
          setIsTyping(false)
          toast.error(msg.data.message ?? 'Something went wrong')
          return
        }

        if (msg.type === 'message' && msg.data.reply) {
          setIsTyping(false)
          if (msg.data.session_id) setActiveSessionId(msg.data.session_id)
          if (msg.data.mood) setCurrentMood(msg.data.mood as MoodLabel)

          setMessages((prev) => [
            ...prev,
            {
              id: makeLocalId(),
              role: 'assistant',
              content: msg.data.reply!,
              mood: msg.data.mood as MoodLabel | undefined,
              mood_score: msg.data.mood_score,
              created_at: new Date().toISOString(),
            },
          ])
        }
      } catch {
        // malformed frame — ignore
      }
    }

    ws.onerror = () => {
      isConnectingRef.current = false
      setIsConnected(false)
      toast.error('Chat connection error. Reconnecting…')
    }

    ws.onclose = () => {
      isConnectingRef.current = false
      setIsConnected(false)
      if (pingRef.current) clearInterval(pingRef.current)
      // Auto-reconnect after 3s
      if (isMountedRef.current) {
        setTimeout(() => connect(), 3_000)
      }
    }
  }, [getToken, setCurrentMood])

  useEffect(() => {
    connect()
    return () => {
      if (pingRef.current) clearInterval(pingRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      toast.error('Not connected. Reconnecting…')
      connect()
      return
    }

    const userMsg: ChatMessage = {
      id: makeLocalId(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    wsRef.current.send(JSON.stringify({ message: text }))
  }, [connect])

  const clearMessages = useCallback(() => setMessages([]), [])

  return {
    messages,
    isTyping,
    isConnected,
    sessionId: activeSessionId,
    sendMessage,
    clearMessages,
  }
}
