"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ClipboardCheck, PackageX, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("employee")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-sidebar p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-sidebar-foreground">
          <PackageX className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">WriteOff</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-balance">Create your account</CardTitle>
            <CardDescription>Register to submit or review merchandise write-offs.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jordan Rivera"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Account type</Label>
                  <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-3">
                    <Label
                      htmlFor="role-employee"
                      className="flex cursor-pointer flex-col items-start gap-1 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="employee" id="role-employee" />
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Employee</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Submit write-offs</span>
                    </Label>
                    <Label
                      htmlFor="role-reviewer"
                      className="flex cursor-pointer flex-col items-start gap-1 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="reviewer" id="role-reviewer" />
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Reviewer</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Approve &amp; reject</span>
                    </Label>
                  </RadioGroup>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4">
                  Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
