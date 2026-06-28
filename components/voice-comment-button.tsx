"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, MicOff, Square } from "lucide-react"

interface VoiceCommentButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

type RecognitionState = "idle" | "listening" | "error"

export function VoiceCommentButton({ onTranscript, disabled }: VoiceCommentButtonProps) {
  const [state, setState] = useState<RecognitionState>("idle")
  const [unsupported, setUnsupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognition =
      (window as typeof window & { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setUnsupported(true)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript
        }
      }
      if (transcript.trim()) {
        onTranscript(transcript.trim())
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        setState("error")
        setTimeout(() => setState("idle"), 2000)
      }
    }

    recognition.onend = () => {
      setState((prev) => (prev === "listening" ? "idle" : prev))
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [onTranscript])

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (state === "listening") {
      recognition.stop()
      setState("idle")
    } else {
      try {
        recognition.start()
        setState("listening")
      } catch {
        setState("error")
        setTimeout(() => setState("idle"), 2000)
      }
    }
  }, [state])

  if (unsupported) return null

  const isListening = state === "listening"
  const isError = state === "error"

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={isListening ? "Stop recording" : "Start voice input"}
      aria-pressed={isListening}
      className={[
        "relative flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "size-12 shrink-0",
        isError
          ? "bg-destructive text-destructive-foreground shadow-md"
          : isListening
            ? "bg-primary text-primary-foreground shadow-lg scale-110"
            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/50",
        disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer",
      ].join(" ")}
    >
      {/* Pulse ring when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-pulse" />
        </>
      )}

      {isError ? (
        <MicOff className="relative size-5" />
      ) : isListening ? (
        <Square className="relative size-4 fill-current" />
      ) : (
        <Mic className="relative size-5" />
      )}
    </button>
  )
}
