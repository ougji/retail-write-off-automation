"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWriteOffs } from "@/lib/use-write-offs"
import { verifyWriteOff } from "@/app/actions/write-offs"
import type { WriteOff } from "@/lib/types"
import { CheckCheck, MapPin, Inbox, User, Wallet } from "lucide-react"

const VERIFY_REASONS = ["Expired", "Equipment Failure (Fridge)", "Staff Error"] as const

// Weekly waste budget allotted per store (USD).
const WEEKLY_BUDGET = 500

function PendingCard({ writeOff, onDone }: { writeOff: WriteOff; onDone: () => void }) {
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState<string>("")

  async function handleVerify() {
    if (!reason) {
      toast.error("Please select a reason before verifying.")
      return
    }
    setBusy(true)
    try {
      await verifyWriteOff(
        writeOff.id,
        writeOff.withDeduction && writeOff.responsiblePersonId
          ? { id: writeOff.responsiblePersonId, name: writeOff.responsiblePersonName ?? "" }
          : null,
      )
      await onDone()
      toast.success(`Verified as "${reason}" and sent to Control.`)
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

        <div className="space-y-1.5">
          <Label htmlFor={`reason-${writeOff.id}`}>Reason</Label>
          <Select value={reason} onValueChange={(v) => setReason(v ?? "")}>
            <SelectTrigger id={`reason-${writeOff.id}`}>
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              {VERIFY_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleVerify} className="w-full gap-1.5" disabled={busy}>
          <CheckCheck className="size-4" />
          {busy ? "Verifying..." : "Verify"}
        </Button>
      </CardContent>
    </Card>
  )
}

function isThisWeek(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return d >= weekAgo && d <= now
}

function BudgetTracker({ writeOffs }: { writeOffs: WriteOff[] }) {
  const stores = useMemo(() => {
    const map = new Map<string, string>()
    for (const w of writeOffs) map.set(w.storeId, w.storeName)
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [writeOffs])

  const [storeId, setStoreId] = useState<string>("")
  const activeStoreId = storeId || stores[0]?.id || ""

  const spent = useMemo(
    () =>
      writeOffs
        .filter(
          (w) =>
            w.storeId === activeStoreId &&
            w.status !== "rejected" &&
            isThisWeek(w.createdAt),
        )
        .reduce((s, w) => s + w.totalValue, 0),
    [writeOffs, activeStoreId],
  )

  if (stores.length === 0) return null

  const pct = Math.min(100, Math.round((spent / WEEKLY_BUDGET) * 100))
  const over = spent > WEEKLY_BUDGET
  const barTone = over
    ? "bg-destructive"
    : pct >= 80
      ? "bg-chart-3"
      : "bg-primary"

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="size-4 text-muted-foreground" />
          Weekly waste budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={activeStoreId} onValueChange={(v) => setStoreId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select store..." />
          </SelectTrigger>
          <SelectContent>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-foreground">
              ${spent.toFixed(0)}{" "}
              <span className="text-muted-foreground">/ ${WEEKLY_BUDGET}</span>
            </span>
            <span
              className={
                "text-xs font-medium " +
                (over ? "text-destructive" : pct >= 80 ? "text-chart-3" : "text-muted-foreground")
              }
            >
              {pct}% used
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={"h-full rounded-full transition-all " + barTone}
              style={{ width: `${pct}%` }}
            />
          </div>
          {over && (
            <p className="text-xs font-medium text-destructive">
              Over budget by ${(spent - WEEKLY_BUDGET).toFixed(0)} this week.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SupervisorView() {
  const { writeOffs, mutate } = useWriteOffs()
  const pending = writeOffs.filter((w) => w.status === "pending")

  return (
    <div className="space-y-6">
      <BudgetTracker writeOffs={writeOffs} />

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
    </div>
  )
}
