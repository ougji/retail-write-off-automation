"use client"

import { AppHeader } from "@/components/app-header"
import { LineStaffView } from "@/components/line-staff-view"
import { SupervisorView } from "@/components/supervisor-view"
import { ControlView } from "@/components/control-view"
import type { Role } from "@/lib/types"

export function Dashboard({ role, name }: { role: Role; name: string }) {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader role={role} name={name} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {role === "line_staff" && <LineStaffView />}
        {role === "supervisor" && <SupervisorView />}
        {role === "control" && <ControlView />}
      </main>
    </div>
  )
}
