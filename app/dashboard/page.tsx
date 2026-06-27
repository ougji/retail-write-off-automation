import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { EmployeeView } from "@/components/employee-view"
import { ReviewerView } from "@/components/reviewer-view"
import type { WriteOff } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const role = (user.user_metadata?.role as string) === "reviewer" ? "reviewer" : "employee"
  const name = (user.user_metadata?.full_name as string) || user.email || "User"

  const { data } = await supabase.from("write_offs").select("*").order("created_at", { ascending: false })
  const writeOffs = (data ?? []) as WriteOff[]

  return (
    <div className="min-h-svh bg-background">
      <AppHeader name={name} role={role} />
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        {role === "reviewer" ? (
          <ReviewerView writeOffs={writeOffs} />
        ) : (
          <EmployeeView writeOffs={writeOffs} />
        )}
      </main>
    </div>
  )
}
