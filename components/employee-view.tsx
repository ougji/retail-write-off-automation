import type { WriteOff } from "@/lib/types"
import { WriteOffForm } from "@/components/write-off-form"
import { WriteOffCard } from "@/components/write-off-card"
import { StatCards } from "@/components/stat-cards"
import { FileText } from "lucide-react"

export function EmployeeView({ writeOffs }: { writeOffs: WriteOff[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">My write-offs</h1>
        <p className="text-sm text-muted-foreground">Submit merchandise write-offs and track their status.</p>
      </div>

      <StatCards writeOffs={writeOffs} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
        <WriteOffForm />

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent submissions</h2>
          {writeOffs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No write-offs yet</p>
              <p className="text-xs text-muted-foreground">Submit your first write-off using the form.</p>
            </div>
          ) : (
            writeOffs.map((w) => <WriteOffCard key={w.id} writeOff={w} />)
          )}
        </div>
      </div>
    </div>
  )
}
