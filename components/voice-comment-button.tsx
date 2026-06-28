"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, MicOff, Square } from "lucide-react"

interface VoiceCommentButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

type RecognitionState = "idle" | "listening" | "error"

// Stable reference to the SpeechRecognition constructor, resolved once.
function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null
  return (
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition })
      .SpeechRecognition ??
    (
      window as unknown as {
        webkitSpeechRecognition?: typeof SpeechRecognition
      }
    ).webkitSpeechRecognition ??
    null
  )
}

export function VoiceCommentButton({
  onTranscript,
  disabled,
}: VoiceCommentButtonProps) {
  const [state, setState] = useState<RecognitionState>("idle")
  const [unsupported, setUnsupported] = useState(false)

  // Keep a stable ref to onTranscript so recognition handlers never go stale.
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
  })

  // Intentionally stop flag — prevents auto-restart on manual stop.
  const stoppingRef = useRef(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SR = getSpeechRecognition()
    if (!SR) {
      setUnsupported(true)
    }
    // No instance created here — created fresh on each start() call.
  }, [])

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) return

    stoppingRef.current = false

    // Abort any existing session first.
    recognitionRef.current?.abort()

    const recognition = new SR()
    recognition.continuous = false  // single-shot is most reliable cross-origin
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
        onTranscriptRef.current(transcript.trim())
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "aborted" fires when we call .abort() ourselves — ignore it.
      if (event.error === "aborted") return
      // "no-speech" is benign — just stop quietly.
      if (event.error === "no-speech") {
        setState("idle")
        return
      }
      setState("error")
      setTimeout(() => setState("idle"), 2500)
    }

    recognition.onend = () => {
      if (stoppingRef.current) {
        // User pressed stop — settle to idle.
        setState("idle")
        return
      }
      // Auto-restart to mimic continuous listening.
      // Re-check flag in case stop was pressed while onend was queued.
      if (!stoppingRef.current) {
        startListening()
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setState("listening")
    } catch {
      setState("error")
      setTimeout(() => setState("idle"), 2500)
    }
  }, [])  // empty deps — stable because it only touches refs

  const stopListening = useCallback(() => {
    stoppingRef.current = true
    recognitionRef.current?.stop()
    setState("idle")
  }, [])

  const toggle = useCallback(() => {
    if (state === "listening") {
      stopListening()
    } else {
      startListening()
    }
  }, [state, startListening, stopListening])

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      stoppingRef.current = true
      recognitionRef.current?.abort()
    }
  }, [])

  if (unsupported) return null

  const isListening = state === "listening"
  const isError = state === "error"

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      aria-pressed={isListening}
      className={[
        "relative flex items-center justify-center rounded-full transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "size-12 shrink-0",
        isError
          ? "bg-destructive text-destructive-foreground shadow-md"
          : isListening
            ? "bg-primary text-primary-foreground shadow-lg scale-110"
            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/50",
        disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer",
      ].join(" ")}
    >
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
