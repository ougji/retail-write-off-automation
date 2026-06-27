"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWriteOffs } from "@/lib/use-write-offs"
import { verifyWriteOff } from "@/app/actions/write-offs"
import type { WriteOff } from "@/lib/types"
import { CheckCheck, MapPin, Inbox, User } from "lucide-react"

function PendingCard({ writeOff, onDone }: { writeOff: WriteOff; onDone: () => void }) {
  const [busy, setBusy] = useState(false)

  async function handleVerify() {
    setBusy(true)
    try {
      await verifyWriteOff(
        writeOff.id,
        writeOff.withDeduction && writeOff.responsiblePersonId
          ? { id: writeOff.responsiblePersonId, name: writeOff.responsiblePersonName ?? "" }
          : null,
      )
      await onDone()
      toast.success("Request verified and sent to Control.")
    } catch {
      toast.error("Could not verify. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{writeOff.storeName}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              By {writeOff.submitterName} · {new Date(writeOff.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              writeOff.withDeduction
                ? "shrink-0 border-destructive/30 bg-destructive/10 text-destructive"
                : "shrink-0 border-border"
            }
          >
            {writeOff.withDeduction ? "With Deduction" : "No Deduction"}
          </Badge>
        </div>

        <p className="text-sm font-medium text-foreground">{writeOff.reason}</p>

        {writeOff.photoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={writeOff.photoDataUrl || "/placeholder.svg"}
            alt="Submitted evidence"
            className="h-40 w-full rounded-lg border border-border object-cover"
          />
        )}

        <div className="flex flex-wrap gap-1.5">
          {writeOff.items.map((i) => (
            <span
              key={i.id}
              className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              -{i.quantity} {i.name}
            </span>
          ))}
        </div>

        <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">{writeOff.comment}</p>

        {writeOff.withDeduction && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <User className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Responsible person</p>
              <p className="truncate text-sm font-medium text-foreground">
                {writeOff.responsiblePersonName ?? "Not specified"}
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleVerify} className="w-full gap-1.5" disabled={busy}>
          <CheckCheck className="size-4" />
          {busy ? "Verifying..." : "Verify"}
        </Button>
      </CardContent>
    </Card>
  )
}

export function SupervisorView() {
  const { writeOffs, mutate } = useWriteOffs()
  const pending = writeOffs.filter((w) => w.status === "pending")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Pending review</h2>
        <Badge variant="secondary">{pending.length}</Badge>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Inbox className="size-8" />
            <p className="text-sm">No requests waiting for verification.</p>
          </CardContent>
        </Card>
      ) : (
        pending.map((w) => <PendingCard key={w.id} writeOff={w} onDone={mutate} />)
      )}
    </div>
  )
}
