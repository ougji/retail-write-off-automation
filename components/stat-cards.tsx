import { Card, CardContent } from "@/components/ui/card"
import type { WriteOff } from "@/lib/types"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export function StatCards({ writeOffs }: { writeOffs: WriteOff[] }) {
  const pending = writeOffs.filter((w) => w.status === "pending").length
  const approved = writeOffs.filter((w) => w.status === "approved").length
  const rejected = writeOffs.filter((w) => w.status === "rejected").length

  const stats = [
    { label: "Pending", value: pending, icon: Clock, className: "text-chart-2" },
    { label: "Approved", value: approved, icon: CheckCircle2, className: "text-primary" },
    { label: "Rejected", value: rejected, icon: XCircle, className: "text-destructive" },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <s.icon className={`h-4 w-4 ${s.className}`} />
              {s.label}
            </div>
            <span className="text-2xl font-semibold tabular-nums">{s.value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
