"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, PackageX } from "lucide-react"
import { useRouter } from "next/navigation"

export function AppHeader({ name, role }: { name: string; role: string }) {
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <PackageX className="h-6 w-6 text-primary" />
          <span className="text-base font-semibold tracking-tight">WriteOff</span>
          <Badge
            variant="secondary"
            className="ml-1 capitalize bg-sidebar-accent text-sidebar-accent-foreground"
          >
            {role}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-sidebar-foreground/70 sm:inline">{name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
