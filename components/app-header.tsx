"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { ROLE_LABELS, type Role } from "@/lib/types"
import { ClipboardCheck, LogOut } from "lucide-react"

export function AppHeader({ role, name }: { role: Role; name: string }) {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ClipboardCheck className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </header>
  )
}
