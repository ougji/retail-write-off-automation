"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Status = "idle" | "recording" | "transcribing"

interface VoiceCommentButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceCommentButton({ onTranscript, disabled, className }: VoiceCommentButtonProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Microphone not supported on this device.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        await transcribeAudio()
      }

      recorder.start()
      setStatus("recording")
      setDuration(0)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    } catch (err) {
      toast.error("Microphone access denied. Please allow microphone permissions.")
    }
  }

  const stopRecording = () => {
    stopTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      setStatus("transcribing")
      mediaRecorderRef.current.stop()
    }
  }

  const transcribeAudio = async () => {
    try {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
      const formData = new FormData()
      formData.append("file", audioBlob, "recording.webm")
      formData.append("model", "whisper-1")

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error ?? "Transcription failed")
      }

      const data = await res.json()
      const text: string = data.text?.trim() ?? ""

      if (text) {
        onTranscript(text)
        toast.success("Voice comment added.")
      } else {
        toast.warning("No speech detected. Try again.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transcription failed.")
    } finally {
      setStatus("idle")
      setDuration(0)
    }
  }

  const handleClick = () => {
    if (status === "idle") startRecording()
    else if (status === "recording") stopRecording()
  }

  const isRecording = status === "recording"
  const isTranscribing = status === "transcribing"

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isTranscribing}
        aria-label={
          isRecording
            ? "Stop recording"
            : isTranscribing
              ? "Transcribing..."
              : "Start voice comment"
        }
        aria-pressed={isRecording}
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          isRecording
            ? "border-destructive bg-destructive text-destructive-foreground animate-pulse"
            : isTranscribing
              ? "border-muted-foreground bg-muted text-muted-foreground"
              : "border-primary bg-primary text-primary-foreground hover:opacity-90",
        )}
      >
        {/* Ripple ring when recording */}
        {isRecording && (
          <span
            className="absolute inset-0 rounded-full border-2 border-destructive opacity-50 animate-ping"
            aria-hidden="true"
          />
        )}

        {isTranscribing ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-7 w-7" />
        ) : (
          <Mic className="h-7 w-7" />
        )}
      </button>

      <span className="text-xs font-medium text-muted-foreground min-h-[1.25rem]">
        {isTranscribing
          ? "Transcribing..."
          : isRecording
            ? `Recording ${formatDuration(duration)}`
            : "Tap mic to speak"}
      </span>
    </div>
  )
}
