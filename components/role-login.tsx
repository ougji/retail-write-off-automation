"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLES, type Role } from "@/lib/types"
import { ChefHat, ClipboardCheck, Globe, ChevronRight } from "lucide-react"

const ICONS: Record<Role, typeof ChefHat> = {
  line_staff: ChefHat,
  supervisor: ClipboardCheck,
  control: Globe,
}

export function RoleLogin({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ClipboardCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">WriteOff Control</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Select your role to enter the write-off workflow.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription>Choose how you&apos;ll be working today.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {ROLES.map((role) => {
              const Icon = ICONS[role.value]
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => onSelect(role.value)}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium leading-tight">{role.label}</span>
                    <span className="block text-xs text-muted-foreground">{role.subtitle}</span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
