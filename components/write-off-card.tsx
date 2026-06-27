"use client"

import type { WriteOff } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { reviewWriteOff } from "@/app/actions"
import { Check, MapPin, User, UserMinus, X } from "lucide-react"
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

export function WriteOffCard({ writeOff, canReview }: { writeOff: WriteOff; canReview?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<"approved" | "rejected" | null>(null)

  const handleReview = (decision: "approved" | "rejected") => {
    setAction(decision)
    startTransition(async () => {
      const res = await reviewWriteOff(writeOff.id, decision)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(`Write-off ${decision}.`)
      }
      setAction(null)
    })
  }

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
                <MapPin className="h-3.5 w-3.5" />
                {writeOff.store_location}
                <span aria-hidden="true">·</span>
                {formatDate(writeOff.created_at)}
              </div>
            </div>
            <StatusBadge status={writeOff.status} />
          </div>

          <p className="text-sm leading-relaxed text-pretty">{writeOff.comment}</p>

          {writeOff.write_off_type === "with_deduction" && writeOff.deduct_employee && (
            <div className="flex w-fit items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
              <UserMinus className="h-3.5 w-3.5" />
              Deduct from: {writeOff.deduct_employee}
            </div>
          )}

          {canReview && writeOff.status === "pending" && (
            <div className="mt-auto flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => handleReview("approved")}
                disabled={isPending}
              >
                <Check className="h-4 w-4" />
                {action === "approved" ? "Approving..." : "Approve"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReview("rejected")}
                disabled={isPending}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
                {action === "rejected" ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
