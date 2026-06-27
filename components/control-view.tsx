"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { useWriteOffs } from "@/lib/use-write-offs"
import { decideWriteOff } from "@/app/actions/write-offs"
import type { WriteOff } from "@/lib/types"
import { Check, X, MapPin, TriangleAlert, DollarSign, ClipboardList, Inbox } from "lucide-react"

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof DollarSign
  label: string
  value: string
  tone: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + tone}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-none text-foreground">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function VerifiedCard({ writeOff, onDone }: { writeOff: WriteOff; onDone: () => void }) {
  const [busy, setBusy] = useState(false)

  async function decide(decision: "approved" | "rejected") {
    setBusy(true)
    try {
      await decideWriteOff(writeOff.id, decision)
      await onDone()
      if (decision === "approved") toast.success("Synced: Act created in Iiko")
      else toast.error("Request rejected.")
    } catch {
      toast.error("Action failed. Please try again.")
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
              By {writeOff.submitterName} · ${writeOff.totalValue.toFixed(2)} · Verified by{" "}
              {writeOff.verifiedBy}
            </p>
          </div>
          {writeOff.withDeduction ? (
            <Badge
              variant="outline"
              className="shrink-0 border-destructive/30 bg-destructive/10 text-destructive"
            >
              Deduct: {writeOff.responsiblePersonName}
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0 border-border">
              No Deduction
            </Badge>
          )}
        </div>

        <p className="text-sm font-medium text-foreground">{writeOff.reason}</p>

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

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={busy}
            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => decide("rejected")}
          >
            <X className="size-4" />
            Reject
          </Button>
          <Button className="gap-1.5" disabled={busy} onClick={() => decide("approved")}>
            <Check className="size-4" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ControlView() {
  const { writeOffs, mutate } = useWriteOffs()
  const verified = writeOffs.filter((w) => w.status === "verified")

  const totalWaste = writeOffs
    .filter((w) => w.status !== "rejected")
    .reduce((s, w) => s + w.totalValue, 0)
  const deductionCount = writeOffs.filter(
    (w) => w.withDeduction && w.status !== "rejected",
  ).length
  const approvedCount = writeOffs.filter((w) => w.status === "approved").length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={DollarSign}
          label="Total waste value"
          value={`$${totalWaste.toFixed(0)}`}
          tone="bg-chart-3/15 text-chart-3"
        />
        <StatCard
          icon={TriangleAlert}
          label="Deduction anomalies"
          value={String(deductionCount)}
          tone="bg-destructive/15 text-destructive"
        />
        <StatCard
          icon={ClipboardList}
          label="Acts synced"
          value={String(approvedCount)}
          tone="bg-primary/15 text-primary"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Verified — awaiting approval</h2>
          <Badge variant="secondary">{verified.length}</Badge>
        </div>

        {verified.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Inbox className="size-8" />
              <p className="text-sm">No verified requests in the queue.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {verified.map((w) => (
              <VerifiedCard key={w.id} writeOff={w} onDone={mutate} />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {writeOffs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {writeOffs.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{w.storeName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {w.submitterName} · ${w.totalValue.toFixed(2)}
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
