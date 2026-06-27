import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TriangleAlert } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-sidebar p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <TriangleAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription>We couldn&apos;t complete authentication. Please try logging in again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
