"use client"

import type { WriteOff } from "@/lib/types"
import { EMPLOYEE_CODES } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { approveWriteOff, rejectWriteOff, verifyWriteOff } from "@/app/actions"
import { Check, MapPin, ShieldCheck, User, UserMinus, X } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

type ReviewMode = "supervisor" | "control"

export function WriteOffCard({ writeOff, mode }: { writeOff: WriteOff; mode?: ReviewMode }) {
  const [isPending, startTransition] = useTransition()
  const [busy, setBusy] = useState<"primary" | "reject" | null>(null)
  const [deductCode, setDeductCode] = useState("")

  const needsCode = writeOff.write_off_type === "with_deduction"

  const handleVerify = () => {
    if (needsCode && !deductCode) {
      toast.error("Select an employee code to penalize first.")
      return
    }
    setBusy("primary")
    startTransition(async () => {
      const res = await verifyWriteOff(writeOff.id, deductCode || undefined)
      if (res?.error) toast.error(res.error)
      else toast.success("Request verified and sent to Control.")
      setBusy(null)
    })
  }

  const handleApprove = () => {
    setBusy("primary")
    startTransition(async () => {
      const res = await approveWriteOff(writeOff.id)
      if (res?.error) toast.error(res.error)
      else toast.success("Synced: Data sent to Iiko")
      setBusy(null)
    })
  }

  const handleReject = () => {
    setBusy("reject")
    startTransition(async () => {
      const res = await rejectWriteOff(writeOff.id)
      if (res?.error) toast.error(res.error)
      else toast.success("Request rejected.")
      setBusy(null)
    })
  }

  const showSupervisorActions = mode === "supervisor" && writeOff.status === "pending"
  const showControlActions = mode === "control" && writeOff.status === "verified"

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-0 sm:flex-row">
        {writeOff.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={writeOff.photo || "/placeholder.svg"}
            alt={`Write-off at ${writeOff.store_location}`}
            className="h-40 w-full object-cover sm:h-auto sm:w-40 sm:shrink-0"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-muted text-muted-foreground sm:h-auto sm:w-40 sm:shrink-0">
            <span className="text-xs">No photo</span>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-4 sm:py-4 sm:pr-4 sm:pl-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                {writeOff.employee_name}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{writeOff.store_location}</span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0">{formatDate(writeOff.created_at)}</span>
              </div>
            </div>
            <StatusBadge status={writeOff.status} />
          </div>

          <p className="text-sm leading-relaxed text-pretty">{writeOff.comment}</p>

          {needsCode && writeOff.deduct_employee && (
            <div className="flex w-fit items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
              <UserMinus className="h-3.5 w-3.5" />
              Deduct from: {writeOff.deduct_employee}
            </div>
          )}

          {needsCode && !writeOff.deduct_employee && (
            <div className="flex w-fit items-center gap-1.5 rounded-md bg-chart-2/10 px-2 py-1 text-xs font-medium text-chart-2">
              <UserMinus className="h-3.5 w-3.5" />
              Deduction pending assignment
            </div>
          )}

          {/* Supervisor: assign employee code (only for with_deduction) then Verify */}
          {showSupervisorActions && needsCode && (
            <div className="grid gap-1.5">
              <Label htmlFor={`deduct-${writeOff.id}`} className="text-xs text-muted-foreground">
                Assign employee code to penalize
              </Label>
              <Select value={deductCode} onValueChange={setDeductCode}>
                <SelectTrigger id={`deduct-${writeOff.id}`} className="w-full">
                  <SelectValue placeholder="Select employee code" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_CODES.map((e) => (
                    <SelectItem key={e.code} value={`${e.code} · ${e.name}`}>
                      {e.code} · {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showSupervisorActions && (
            <div className="mt-auto flex gap-2 pt-1">
              <Button size="sm" onClick={handleVerify} disabled={isPending}>
                <ShieldCheck className="h-4 w-4" />
                {busy === "primary" ? "Verifying..." : "Verify"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isPending}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
                {busy === "reject" ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          )}

          {showControlActions && (
            <div className="mt-auto flex gap-2 pt-1">
              <Button size="sm" onClick={handleApprove} disabled={isPending}>
                <Check className="h-4 w-4" />
                {busy === "primary" ? "Syncing..." : "Approve & Sync"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isPending}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
                {busy === "reject" ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
