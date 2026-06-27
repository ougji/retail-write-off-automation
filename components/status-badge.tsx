import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_META, type WriteOffStatus } from "@/lib/types"
import { CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react"

const icons: Record<WriteOffStatus, typeof Clock> = {
  pending: Clock,
  verified: ShieldCheck,
  approved: CheckCircle2,
  rejected: XCircle,
}

export function StatusBadge({ status }: { status: WriteOffStatus }) {
  const meta = STATUS_META[status]
  const Icon = icons[status]
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", meta.className)}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </Badge>
  )
}
