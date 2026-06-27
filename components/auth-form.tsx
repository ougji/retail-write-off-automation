"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ROLES, type Role } from "@/lib/types"
import { ChefHat, ClipboardCheck, Globe } from "lucide-react"

const ROLE_ICONS: Record<Role, typeof ChefHat> = {
  line_staff: ChefHat,
  supervisor: ClipboardCheck,
  control: Globe,
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("line_staff")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name, role } as never)
      : await authClient.signIn.email({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message ?? "Something went wrong")
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ClipboardCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground">
            {isSignUp ? "Create your account" : "WriteOff Control"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            {isSignUp ? "Sign up and choose your role" : "Sign in to continue"}
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <div className="flex flex-col gap-2">
                  {ROLES.map((r) => {
                    const Icon = ROLE_ICONS[r.value]
                    const active = role === r.value
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={
                          "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors " +
                          (active
                            ? "border-primary bg-accent"
                            : "border-border bg-card hover:bg-accent")
                        }
                        aria-pressed={active}
                      >
                        <span
                          className={
                            "flex size-9 shrink-0 items-center justify-center rounded-lg " +
                            (active
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground")
                          }
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium leading-tight text-foreground">
                            {r.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">{r.subtitle}</span>
                        </span>
                        <span
                          className={
                            "size-4 rounded-full border-2 " +
                            (active ? "border-primary bg-primary" : "border-muted-foreground/40")
                          }
                          aria-hidden
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <Link
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}
