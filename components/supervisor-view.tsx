"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { EMPLOYEES, type WriteOff } from "@/lib/types"
import { CheckCheck, MapPin, Inbox } from "lucide-react"

function PendingCard({ writeOff }: { writeOff: WriteOff }) {
  const { verify } = useStore()
  const [responsible, setResponsible] = useState<string>("")
  const needsDeduction = writeOff.write_off_type === "with_deduction"

  function handleVerify() {
    if (needsDeduction && !responsible) {
      toast.error("Select the responsible employee before verifying.")
      return
    }
    verify(writeOff.id, needsDeduction ? responsible : null)
    toast.success("Request verified and sent to Control.")
  }

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
              By {writeOff.submitted_by} · {new Date(writeOff.created_at).toLocaleString()}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              needsDeduction
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-border"
            }
          >
            {needsDeduction ? "With Deduction" : "No Deduction"}
          </Badge>
        </div>

        {writeOff.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={writeOff.photo || "/placeholder.svg"}
            alt="Submitted evidence"
            className="h-40 w-full rounded-lg border border-border object-cover"
          />
        )}

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

        {needsDeduction && (
          <div className="space-y-2">
            <Label className="text-destructive">Responsible employee (required)</Label>
            <Select value={responsible} onValueChange={setResponsible}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select employee to penalize" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleVerify} className="w-full gap-1.5">
          <CheckCheck className="size-4" />
          Verify
        </Button>
      </CardContent>
    </Card>
  )
}

export function SupervisorView() {
  const { writeOffs } = useStore()
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
        pending.map((w) => <PendingCard key={w.id} writeOff={w} />)
      )}
    </div>
  )
}
