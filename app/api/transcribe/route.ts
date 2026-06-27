import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured. Add OPENAI_API_KEY to your environment variables." },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 })
  }

  const audioFile = formData.get("file")
  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json({ error: "No audio file provided." }, { status: 400 })
  }

  const whisperForm = new FormData()
  whisperForm.append("file", audioFile, "recording.webm")
  whisperForm.append("model", "whisper-1")
  whisperForm.append("language", "en")

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: whisperForm,
  })

  if (!whisperRes.ok) {
    const errBody = await whisperRes.json().catch(() => ({}))
    const message = errBody?.error?.message ?? "Transcription service error."
    return NextResponse.json({ error: message }, { status: whisperRes.status })
  }

  const result = await whisperRes.json()
  return NextResponse.json({ text: result.text ?? "" })
}
