"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { BudgetTracker } from "@/components/budget-tracker"
import { useWriteOffs } from "@/lib/use-write-offs"
import { useExpenses } from "@/lib/use-expenses"
import { decideWriteOff } from "@/app/actions/write-offs"
import { STORES } from "@/lib/stores"
import type { Expense, WriteOff } from "@/lib/types"
import {
  Check,
  X,
  MapPin,
  TriangleAlert,
  DollarSign,
  ClipboardList,
  Inbox,
  Snowflake,
  UserCog,
  BarChart3,
} from "lucide-react"

interface SmartAlert {
  id: string
  icon: typeof Snowflake
  title: string
  detail: string
  hint: string
  tone: string
}

const SMART_ALERTS: SmartAlert[] = [
  {
    id: "buns",
    icon: Snowflake,
    title: "Green Plaza Aktau",
    detail: "-42% burger buns anomaly spike",
    hint: "Check freezer connection",
    tone: "border-destructive/30 bg-destructive/5 text-destructive",
  },
  {
    id: "shift",
    icon: UserCog,
    title: "Magnum Zhetysu Almaty",
    detail: "70% of waste occurring under the same employee shift",
    hint: "Review shift accountability",
    tone: "border-chart-3/30 bg-chart-3/5 text-chart-3",
  },
]

const STORE_CITY = new Map(STORES.map((s) => [s.id, s.city]))

function SmartAlerts() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <TriangleAlert className="size-4 text-chart-3" />
        <h2 className="text-sm font-medium text-muted-foreground">Smart Alerts / Anomalies</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SMART_ALERTS.map((a) => (
          <Card key={a.id} className={"border " + a.tone}>
            <CardContent className="flex gap-3 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background/60">
                <a.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="mt-0.5 text-sm text-foreground/80">{a.detail}</p>
                <p className="mt-1.5 text-xs font-medium opacity-90">{a.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BranchWasteChart({
  writeOffs,
  expenses,
}: {
  writeOffs: WriteOff[]
  expenses: Expense[]
}) {
  // Aggregate real waste value + logged expenses per branch (city).
  const totals = new Map<string, number>()
  for (const w of writeOffs) {
    if (w.status === "rejected") continue
    const city = STORE_CITY.get(w.storeId) ?? "Other"
    totals.set(city, (totals.get(city) ?? 0) + w.totalValue)
  }
  for (const e of expenses) {
    const city = e.city || STORE_CITY.get(e.storeId) || "Other"
    totals.set(city, (totals.get(city) ?? 0) + e.amount)
  }

  const branches = Array.from(totals, ([branch, value]) => ({ branch, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
  const max = Math.max(1, ...branches.map((b) => b.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-4 text-muted-foreground" />
          Waste expenses by branch
        </CardTitle>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No waste data recorded yet.
          </p>
        ) : (
          <div className="flex h-52 items-end justify-around gap-3 sm:gap-6">
            {branches.map((b) => {
              const heightPct = Math.max(4, Math.round((b.value / max) * 100))
              return (
                <div
                  key={b.branch}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-semibold text-foreground">${b.value.toFixed(0)}</span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-primary transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="max-w-full truncate text-xs font-medium text-muted-foreground">
                    {b.branch}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

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
  const { expenses } = useExpenses()
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
      <SmartAlerts />

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

      <BudgetTracker writeOffs={writeOffs} expenses={expenses} />

      <BranchWasteChart writeOffs={writeOffs} expenses={expenses} />

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
