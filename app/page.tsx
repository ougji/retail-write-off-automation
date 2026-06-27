import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import type { Role } from "@/lib/types"

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const role = ((session.user as { role?: string }).role ?? "line_staff") as Role

  return <Dashboard role={role} name={session.user.name} />
}
