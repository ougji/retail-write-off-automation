"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STORES } from "@/lib/stores"
import { createExpense } from "@/app/actions/expenses"
import type { Expense, WriteOff } from "@/lib/types"
import { Wallet, Plus } from "lucide-react"

// Weekly waste budget allotted per store (USD).
export const WEEKLY_BUDGET = 500
const OVERALL = "__overall__"

const STORE_CITY = new Map(STORES.map((s) => [s.id, s.city]))

function isThisWeek(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return d >= weekAgo && d <= now
}

export function BudgetTracker({
  writeOffs,
  expenses,
  canAddExpense = false,
  onExpenseAdded,
}: {
  writeOffs: WriteOff[]
  expenses: Expense[]
  canAddExpense?: boolean
  onExpenseAdded?: () => void
}) {
  // Distinct stores that have any activity (write-offs or expenses).
  const stores = useMemo(() => {
    const map = new Map<string, string>()
    for (const w of writeOffs) map.set(w.storeId, w.storeName)
    for (const e of expenses) map.set(e.storeId, e.storeName)
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [writeOffs, expenses])

  const [scope, setScope] = useState<string>(OVERALL)
  const isOverall = scope === OVERALL

  // Money spent this week within the selected scope.
  const spent = useMemo(() => {
    const woTotal = writeOffs
      .filter(
        (w) =>
          (isOverall || w.storeId === scope) &&
          w.status !== "rejected" &&
          isThisWeek(w.createdAt),
      )
      .reduce((s, w) => s + w.totalValue, 0)
    const expTotal = expenses
      .filter((e) => (isOverall || e.storeId === scope) && isThisWeek(e.createdAt))
      .reduce((s, e) => s + e.amount, 0)
    return woTotal + expTotal
  }, [writeOffs, expenses, scope, isOverall])

  const budget = isOverall ? WEEKLY_BUDGET * Math.max(1, stores.length) : WEEKLY_BUDGET
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
  const over = spent > budget
  const barTone = over ? "bg-destructive" : pct >= 80 ? "bg-chart-3" : "bg-primary"
  const labelTone = over
    ? "text-destructive"
    : pct >= 80
      ? "text-chart-3"
      : "text-muted-foreground"

  // --- Add-expense form state ---
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleAdd() {
    const value = Number.parseFloat(amount)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a valid expense amount.")
      return
    }
    if (isOverall) {
      toast.error("Select a specific store to log an expense.")
      return
    }
    const store = STORES.find((s) => s.id === scope)
    const storeName = stores.find((s) => s.id === scope)?.name ?? store?.name ?? "Store"
    setBusy(true)
    try {
      await createExpense({
        storeId: scope,
        storeName,
        city: store?.city ?? STORE_CITY.get(scope) ?? "",
        amount: value,
        note: note.trim(),
      })
      setAmount("")
      setNote("")
      onExpenseAdded?.()
      toast.success(`Logged $${value.toFixed(0)} expense.`)
    } catch {
      toast.error("Could not log expense. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="size-4 text-muted-foreground" />
          Weekly waste budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={scope} onValueChange={(v) => setScope(v ?? OVERALL)}>
          <SelectTrigger>
            <SelectValue placeholder="Select scope..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={OVERALL}>Overall — all stores</SelectItem>
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
              ${spent.toFixed(0)} <span className="text-muted-foreground">/ ${budget}</span>
            </span>
            <span className={"text-xs font-medium " + labelTone}>{pct}% used</span>
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
          {over ? (
            <p className="text-xs font-medium text-destructive">
              Over budget by ${(spent - budget).toFixed(0)} this week.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              ${(budget - spent).toFixed(0)} remaining this week
              {isOverall ? ` across ${stores.length} store${stores.length === 1 ? "" : "s"}` : ""}.
            </p>
          )}
        </div>

        {canAddExpense && (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              Log a waste expense{isOverall ? " (select a store first)" : ""}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="Amount ($)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="sm:w-32"
                disabled={isOverall || busy}
              />
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-1"
                disabled={isOverall || busy}
              />
              <Button onClick={handleAdd} disabled={isOverall || busy} className="gap-1.5">
                <Plus className="size-4" />
                {busy ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
