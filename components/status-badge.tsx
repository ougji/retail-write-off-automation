import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { WriteOffStatus } from "@/lib/types"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

const config: Record<WriteOffStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: {
    label: "Pending",
    className: "border-chart-2/30 bg-chart-2/10 text-chart-2",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "border-primary/30 bg-primary/10 text-primary",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
}

export function StatusBadge({ status }: { status: WriteOffStatus }) {
  const { label, className, icon: Icon } = config[status]
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  )
}
