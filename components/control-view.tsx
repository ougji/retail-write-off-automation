"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { useStore } from "@/lib/store"
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
          <p className="truncate text-lg font-semibold leading-none">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function VerifiedCard({ writeOff }: { writeOff: WriteOff }) {
  const { approve, reject } = useStore()

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="size-4 text-muted-foreground" />
              {writeOff.store_location}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              By {writeOff.submitted_by} · ${writeOff.estimated_cost.toFixed(2)}
            </p>
          </div>
          {writeOff.write_off_type === "with_deduction" ? (
            <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
              Deduct: {writeOff.responsible_employee}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-border">
              No Deduction
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {writeOff.ingredients.map((i) => (
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
            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              reject(writeOff.id)
              toast.error("Request rejected.")
            }}
          >
            <X className="size-4" />
            Reject
          </Button>
          <Button
            className="gap-1.5"
            onClick={() => {
              approve(writeOff.id)
              toast.success("Synced: Act created in Iiko")
            }}
          >
            <Check className="size-4" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ControlView() {
  const { writeOffs } = useStore()
  const verified = writeOffs.filter((w) => w.status === "verified")

  const totalWaste = writeOffs
    .filter((w) => w.status !== "rejected")
    .reduce((s, w) => s + w.estimated_cost, 0)
  const deductionCount = writeOffs.filter(
    (w) => w.write_off_type === "with_deduction" && w.status !== "rejected",
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
              <VerifiedCard key={w.id} writeOff={w} />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {writeOffs.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{w.store_location}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {w.submitted_by} · ${w.estimated_cost.toFixed(2)}
                  </p>
                </div>
                <StatusBadge status={w.status} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
