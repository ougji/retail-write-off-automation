"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { useStore } from "@/lib/store"
import { STORE_LOCATIONS, type Ingredient, type WriteOffType } from "@/lib/types"
import { ImagePlus, Plus, Trash2, X } from "lucide-react"

const STAFF_NAME = "Jordan Chen"

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function LineStaffView() {
  const { writeOffs, addWriteOff } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [location, setLocation] = useState<string>("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [type, setType] = useState<WriteOffType>("no_deduction")
  const [comment, setComment] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: uid(), name: "", quantity: 1 },
  ])

  const myHistory = writeOffs.filter((w) => w.submitted_by === STAFF_NAME)

  function updateIngredient(id: string, patch: Partial<Ingredient>) {
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  function reset() {
    setLocation("")
    setPhoto(null)
    setType("no_deduction")
    setComment("")
    setIngredients([{ id: uid(), name: "", quantity: 1 }])
    if (fileRef.current) fileRef.current.value = ""
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const cleanIngredients = ingredients.filter((i) => i.name.trim().length > 0)

    if (!location) return toast.error("Select a store location.")
    if (cleanIngredients.length === 0) return toast.error("Add at least one ingredient.")
    if (comment.trim().length < 10)
      return toast.error("Comment must be at least 10 characters.")

    addWriteOff({
      store_location: location,
      photo,
      write_off_type: type,
      comment: comment.trim(),
      ingredients: cleanIngredients,
      submitted_by: STAFF_NAME,
    })
    toast.success("Write-off submitted for review.")
    reset()
  }

  const commentValid = comment.trim().length >= 10

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Write-Off</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label>Store location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_LOCATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Photo evidence</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPhoto}
                className="sr-only"
                aria-label="Upload photo evidence"
              />
              {photo ? (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo || "/placeholder.svg"} alt="Write-off evidence preview" className="h-44 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null)
                      if (fileRef.current) fileRef.current.value = ""
                    }}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
                    aria-label="Remove photo"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  <ImagePlus className="size-6" />
                  <span className="text-sm">Tap to upload a photo</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Write-off type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "no_deduction", label: "No Deduction" },
                    { value: "with_deduction", label: "With Deduction" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
                      (type === opt.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent")
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ingredients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() =>
                    setIngredients((prev) => [...prev, { id: uid(), name: "", quantity: 1 }])
                  }
                >
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center gap-2">
                    <Input
                      value={ing.name}
                      onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                      placeholder="e.g. Beef patty"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={ing.quantity}
                      onChange={(e) =>
                        updateIngredient(ing.id, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-20"
                      aria-label="Quantity"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setIngredients((prev) =>
                          prev.length > 1 ? prev.filter((i) => i.id !== ing.id) : prev,
                        )
                      }
                      aria-label="Remove ingredient"
                      className="shrink-0 text-muted-foreground"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Comment</Label>
                <span
                  className={
                    "text-xs " +
                    (commentValid ? "text-muted-foreground" : "text-destructive")
                  }
                >
                  {comment.trim().length}/10 min
                </span>
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe what happened (minimum 10 characters)..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Write-Off
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          {myHistory.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No submissions yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {myHistory.map((w) => (
                <li key={w.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{w.store_location}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {w.ingredients.map((i) => `-${i.quantity} ${i.name}`).join(", ")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(w.created_at).toLocaleDateString()} ·{" "}
                      {w.write_off_type === "with_deduction" ? "With deduction" : "No deduction"}
                    </p>
                  </div>
                  <StatusBadge status={w.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
