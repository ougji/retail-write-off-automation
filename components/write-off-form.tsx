"use client"

import { useRef, useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { submitWriteOff } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StorePicker } from "@/components/store-picker"
import { VoiceCommentButton } from "@/components/voice-comment-button"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"

export function WriteOffForm() {
  const [type, setType] = useState("no_deduction")
  const [storeLocation, setStoreLocation] = useState("")
  const [comment, setComment] = useState("")
  const commentBaseRef = useRef("")
  const [photoUrl, setPhotoUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()
      const path = `${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from("writeoff-photos").upload(path, file, { upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from("writeoff-photos").getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("write_off_type", type)
    formData.set("store_location", storeLocation)
    formData.set("photo", photoUrl)
    startTransition(async () => {
      const res = await submitWriteOff(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Write-off submitted for review.")
        formRef.current?.reset()
        setType("no_deduction")
        setStoreLocation("")
        setComment("")
        commentBaseRef.current = ""
        setPhotoUrl("")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">New write-off</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="store_location">Store location</Label>
            <StorePicker value={storeLocation} onChange={setStoreLocation} />
          </div>

          <div className="grid gap-2">
            <Label>Photo of merchandise</Label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
            {photoUrl ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl || "/placeholder.svg"}
                  alt="Merchandise to write off"
                  className="h-40 w-40 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="h-24 w-full border-dashed"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-xs">Tap to add photo</span>
                  </span>
                )}
              </Button>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Write-off type</Label>
            <RadioGroup value={type} onValueChange={setType} className="grid gap-3 sm:grid-cols-2">
              <Label
                htmlFor="type-no"
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent"
              >
                <RadioGroupItem value="no_deduction" id="type-no" className="mt-0.5" />
                <span className="flex flex-col">
                  <span className="text-sm font-medium">No deduction</span>
                  <span className="text-xs text-muted-foreground">Standard loss, no one charged</span>
                </span>
              </Label>
              <Label
                htmlFor="type-yes"
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent"
              >
                <RadioGroupItem value="with_deduction" id="type-yes" className="mt-0.5" />
                <span className="flex flex-col">
                  <span className="text-sm font-medium">With deduction</span>
                  <span className="text-xs text-muted-foreground">Charge a specific employee</span>
                </span>
              </Label>
            </RadioGroup>
          </div>

          {type === "with_deduction" && (
            <div className="grid gap-2">
              <Label htmlFor="deduct_employee">Employee to deduct from</Label>
              <Input id="deduct_employee" name="deduct_employee" placeholder="Employee name" />
            </div>
          )}

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="comment">Comment</Label>
              <VoiceCommentButton
                onTranscript={(text) => {
                  const base = commentBaseRef.current
                  setComment(base ? `${base} ${text}` : text)
                }}
              />
            </div>
            <Textarea
              id="comment"
              name="comment"
              required
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                commentBaseRef.current = e.target.value
              }}
              placeholder="Describe the item, reason for write-off, or tap the mic to dictate..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Tap the mic for hands-free voice-to-text dictation.
            </p>
          </div>

          <Button type="submit" disabled={isPending || uploading}>
            {isPending ? "Submitting..." : "Submit write-off"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
