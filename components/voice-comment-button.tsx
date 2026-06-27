"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Mic, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Minimal typing for the Web Speech API (not in standard lib.dom types)
type SpeechRecognitionResult = {
  isFinal: boolean
  0: { transcript: string }
}
type SpeechRecognitionEvent = {
  resultIndex: number
  results: { length: number } & Record<number, SpeechRecognitionResult>
}
type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function VoiceCommentButton({
  onTranscript,
  lang = "ru-RU",
  className,
}: {
  // Receives the full transcript accumulated since recording started
  onTranscript: (text: string, opts: { final: boolean }) => void
  lang?: string
  className?: string
}) {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const finalRef = useRef("")

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null)
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      toast.error("Voice input isn't supported in this browser.")
      return
    }
    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    finalRef.current = ""

    recognition.onresult = (event) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalRef.current += text
        } else {
          interim += text
        }
      }
      const combined = (finalRef.current + interim).trim()
      onTranscript(combined, { final: false })
    }

    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast.error("Microphone access denied. Enable it in your browser settings.")
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        toast.error("Voice input error. Please try again.")
      }
      setRecording(false)
    }

    recognition.onend = () => {
      if (finalRef.current.trim()) {
        onTranscript(finalRef.current.trim(), { final: true })
      }
      setRecording(false)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setRecording(true)
    } catch {
      // start() can throw if already started; ignore
    }
  }, [lang, onTranscript])

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      aria-pressed={recording}
      aria-label={recording ? "Stop voice input" : "Start voice input"}
      title={recording ? "Stop recording" : "Dictate comment"}
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        recording
          ? "border-destructive bg-destructive text-destructive-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
        className,
      )}
    >
      {recording && (
        <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" aria-hidden="true" />
      )}
      {recording ? <Square className="relative h-4 w-4" /> : <Mic className="relative h-4 w-4" />}
      <span className="sr-only">{recording ? "Recording" : "Record"}</span>
    </button>
  )
}
