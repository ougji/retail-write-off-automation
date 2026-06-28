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
  const [message, setMessage] = useState<string | null>(null)

  // Keep a stable ref to onTranscript so recognition handlers never go stale.
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
  })

  // Intentionally stop flag — prevents auto-restart on manual stop.
  const stoppingRef = useRef(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  // Whether the browser has already granted mic access this session.
  const permissionGrantedRef = useRef(false)

  useEffect(() => {
    const SR = getSpeechRecognition()
    if (!SR) setUnsupported(true)
  }, [])

  const showError = useCallback((msg: string) => {
    setState("error")
    setMessage(msg)
  }, [])

  // Begin a recognition session. Assumes mic permission is already granted.
  const beginSession = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) return

    stoppingRef.current = false
    recognitionRef.current?.abort()

    const recognition = new SR()
    recognition.continuous = false // single-shot is most reliable cross-browser
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
      // "no-speech" is benign — just settle to idle.
      if (event.error === "no-speech") {
        stoppingRef.current = true
        setState("idle")
        return
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        stoppingRef.current = true
        permissionGrantedRef.current = false
        showError("Microphone blocked. Allow mic access in your browser, then try again.")
        return
      }
      if (event.error === "network") {
        stoppingRef.current = true
        showError("Network error reaching the speech service. Check your connection.")
        return
      }
      stoppingRef.current = true
      showError("Voice input failed. Please try again.")
    }

    recognition.onend = () => {
      if (stoppingRef.current) {
        setState((s) => (s === "error" ? s : "idle"))
        return
      }
      // Auto-restart to mimic continuous listening.
      beginSession()
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setState("listening")
      setMessage(null)
    } catch {
      showError("Could not start voice input. Please try again.")
    }
  }, [showError])

  const startListening = useCallback(async () => {
    const SR = getSpeechRecognition()
    if (!SR) {
      setUnsupported(true)
      return
    }

    // Explicitly request microphone permission first. This triggers the
    // browser's permission prompt and gives a concrete, catchable error —
    // SpeechRecognition alone often fails silently when permission is denied.
    if (!permissionGrantedRef.current) {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          // Release the mic immediately — SpeechRecognition opens its own.
          stream.getTracks().forEach((t) => t.stop())
          permissionGrantedRef.current = true
        }
      } catch (err) {
        const name = (err as DOMException)?.name
        if (name === "NotAllowedError" || name === "SecurityError") {
          showError("Microphone blocked. Allow mic access in your browser, then try again.")
        } else if (name === "NotFoundError") {
          showError("No microphone found on this device.")
        } else {
          showError("Microphone unavailable in this context. Try the published app.")
        }
        return
      }
    }

    beginSession()
  }, [beginSession, showError])

  const stopListening = useCallback(() => {
    stoppingRef.current = true
    recognitionRef.current?.stop()
    setState("idle")
  }, [])

  const toggle = useCallback(() => {
    if (state === "listening") {
      stopListening()
    } else {
      void startListening()
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
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        aria-pressed={isListening}
        title={
          isListening
            ? "Listening… tap to stop"
            : isError
              ? message ?? "Voice input error"
              : "Tap to dictate your comment"
        }
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

      <span className="sr-only" role="status" aria-live="polite">
        {isListening ? "Listening" : message ?? ""}
      </span>

      {message && (
        <p className="absolute top-full mt-1 w-44 text-center text-xs text-destructive leading-snug">
          {message}
        </p>
      )}
    </div>
  )
}
