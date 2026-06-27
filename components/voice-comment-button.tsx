"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Status = "idle" | "listening"

interface VoiceCommentButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

// Extend window type for cross-browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export function VoiceCommentButton({ onTranscript, disabled, className }: VoiceCommentButtonProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [interimText, setInterimText] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTextRef = useRef("")

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  const startListening = () => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      toast.error(
        "Speech recognition is not supported in this browser. Try Chrome or Edge.",
      )
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognitionRef.current = recognition
    finalTextRef.current = ""

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setStatus("listening")
      setInterimText("")
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      let final = finalTextRef.current

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += (final ? " " : "") + transcript.trim()
        } else {
          interim += transcript
        }
      }

      finalTextRef.current = final
      setInterimText(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone permissions.")
      } else if (event.error !== "aborted") {
        toast.error(`Speech error: ${event.error}`)
      }
      setStatus("idle")
      setInterimText("")
    }

    recognition.onend = () => {
      // Only fires after stopListening() or natural silence timeout
      setStatus("idle")
      setInterimText("")

      const text = finalTextRef.current.trim()
      if (text) {
        onTranscript(text)
        toast.success("Voice comment added.")
      } else if (status === "listening") {
        // ended without any final results
        toast.warning("No speech detected. Try again.")
      }
    }

    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
  }

  const handleClick = () => {
    if (status === "idle") {
      startListening()
    } else {
      stopListening()
    }
  }

  const isListening = status === "listening"

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={isListening ? "Stop listening" : "Start voice comment"}
        aria-pressed={isListening}
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          isListening
            ? "border-destructive bg-destructive text-destructive-foreground"
            : "border-primary bg-primary text-primary-foreground hover:opacity-90",
        )}
      >
        {/* Ripple ring while listening */}
        {isListening && (
          <>
            <span
              className="absolute inset-0 rounded-full border-2 border-destructive opacity-60 animate-ping"
              aria-hidden="true"
            />
            <span
              className="absolute -inset-2 rounded-full border border-destructive/30 animate-ping [animation-delay:150ms]"
              aria-hidden="true"
            />
          </>
        )}

        {isListening ? (
          <MicOff className="h-7 w-7" />
        ) : (
          <Mic className="h-7 w-7" />
        )}
      </button>

      {/* Live interim transcription preview */}
      <span
        className={cn(
          "min-h-[1.25rem] max-w-[12rem] text-center text-xs font-medium leading-relaxed transition-colors",
          isListening && interimText
            ? "text-foreground italic"
            : "text-muted-foreground",
        )}
      >
        {isListening
          ? interimText || "Listening..."
          : "Tap mic to speak"}
      </span>
    </div>
  )
}
