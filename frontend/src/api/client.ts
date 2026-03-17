import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Attach the Clerk JWT to every request.
 * Call this once in App.tsx after Clerk is loaded.
 */
export function setupAuthInterceptor(getToken: () => Promise<string | null>) {
  apiClient.interceptors.request.use(async (config) => {
    const token = await getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
}

// ─── Typed API helpers ────────────────────────────────────
import type {
  AppUser,
  ChatResponse, Conversation, ChatMessage,
  MoodEntry, JournalEntry,
  AnalyticsDashboard, MusicPlaylist,
} from '@/types'

// Re-export types so callers can import from one place
export type UserUpsertPayload = { email: string; display_name?: string; avatar_url?: string }
export type JournalCreatePayload = { title?: string; content: string }
export type JournalUpdatePayload = { title?: string; content?: string }

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  sync: (data: UserUpsertPayload) =>
    apiClient.post<AppUser>('/auth/sync', data).then(r => r.data),
}

// ── Users ─────────────────────────────────────────────────
export const usersApi = {
  me: () => apiClient.get<AppUser>('/users/me').then(r => r.data),
  update: (data: UserUpsertPayload) =>
    apiClient.patch<AppUser>('/users/me', data).then(r => r.data),
}

// ── Chat ─────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (message: string, session_id?: string) =>
    apiClient.post<ChatResponse>('/chat/message', { message, session_id }).then(r => r.data),
  conversations: (limit = 20) =>
    apiClient.get<Conversation[]>('/chat/conversations', { params: { limit } }).then(r => r.data),
  messages: (conversationId: number) =>
    apiClient.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`).then(r => r.data),
}

// ── Mood ─────────────────────────────────────────────────
export const moodApi = {
  history: (limit = 30) =>
    apiClient.get<MoodEntry[]>('/mood/history', { params: { limit } }).then(r => r.data),
}

// ── Journal ──────────────────────────────────────────────
export const journalApi = {
  list: (limit = 20) =>
    apiClient.get<JournalEntry[]>('/journal/', { params: { limit } }).then(r => r.data),
  create: (data: JournalCreatePayload) =>
    apiClient.post<JournalEntry>('/journal/', data).then(r => r.data),
  update: (id: number, data: JournalUpdatePayload) =>
    apiClient.patch<JournalEntry>(`/journal/${id}`, data).then(r => r.data),
  delete: (id: number) =>
    apiClient.delete(`/journal/${id}`),
  insight: (id: number) =>
    apiClient.get<{ insight: string }>(`/journal/${id}/insight`).then(r => r.data),
}

// ── Analytics ────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () =>
    apiClient.get<AnalyticsDashboard>('/analytics/dashboard').then(r => r.data),
}

// ── Music ────────────────────────────────────────────────
export const musicApi = {
  playlist: (mood: string) =>
    apiClient.get<MusicPlaylist>('/music/', { params: { mood } }).then(r => r.data),
}

// ── TTS ──────────────────────────────────────────────────
export const ttsApi = {
  generate: (text: string, voice_id?: string) =>
    apiClient.post<{ success: boolean; audio_url: string }>('/tts/', { text, voice_id }).then(r => r.data),
}
