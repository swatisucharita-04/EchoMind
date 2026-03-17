import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

interface UseVoiceOptions {
  onTranscript: (text: string) => void
}

export function useVoice({ onTranscript }: UseVoiceOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

        // Use Web Speech API as a free STT fallback (browser-side)
        // For production, send blob to your /api/v1/stt endpoint
        setIsProcessing(true)
        try {
          const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          if (SpeechRecognition) {
            // Browser STT — already handled via onresult below
          }
          // TODO: Replace with AssemblyAI backend call when stt endpoint is ready:
          // const form = new FormData()
          // form.append('file', blob, 'audio.webm')
          // const { data } = await apiClient.post('/stt/', form)
          // onTranscript(data.text)
        } finally {
          setIsProcessing(false)
        }
      }

      recorder.start()
      setIsRecording(true)

      // Also start browser speech recognition for instant feedback
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript ?? ''
          if (transcript) {
            onTranscript(transcript)
          }
        }
        recognition.onerror = () => {
          toast.error('Voice recognition failed. Try typing instead.')
        }
        recognition.start()
        ;(mediaRecorderRef.current as any)._recognition = recognition
      }
    } catch (err) {
      toast.error('Microphone access denied.')
      console.error(err)
    }
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    ;(mediaRecorderRef.current as any)?._recognition?.stop()
    setIsRecording(false)
  }, [])

  return { isRecording, isProcessing, startRecording, stopRecording }
}
