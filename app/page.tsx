"use client"

import { useState } from "react"
import { StoreProvider } from "@/lib/store"
import { RoleLogin } from "@/components/role-login"
import { AppHeader } from "@/components/app-header"
import { LineStaffView } from "@/components/line-staff-view"
import { SupervisorView } from "@/components/supervisor-view"
import { ControlView } from "@/components/control-view"
import type { Role } from "@/lib/types"

export default function Home() {
  const [role, setRole] = useState<Role | null>(null)

  if (!role) {
    return <RoleLogin onSelect={setRole} />
  }

  return (
    <StoreProvider>
      <div className="min-h-dvh bg-background">
        <AppHeader role={role} onLogout={() => setRole(null)} />
        <main className="mx-auto max-w-2xl px-4 py-6">
          {role === "line_staff" && <LineStaffView />}
          {role === "supervisor" && <SupervisorView />}
          {role === "control" && <ControlView />}
        </main>
      </div>
    </StoreProvider>
  )
}
