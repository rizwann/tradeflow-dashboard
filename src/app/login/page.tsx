import { login } from "./actions"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata = {
  title: "Login",
}

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-stretch">
        <Card className="mx-auto w-full max-w-sm border-border/65 bg-background/92 lg:mx-0 lg:max-w-none">
          <CardHeader className="pb-2">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-primary/10 text-sm font-semibold tracking-[0.18em] text-primary">
              TF
            </div>
            <CardTitle className="text-2xl">TradeFlow</CardTitle>
            <CardDescription>
              Sign in to manage inventory, shipments, and FIFO profitability.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-5">
            {params.error === "invalid-credentials" ? (
              <div className="rounded-[1.1rem] border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Invalid email or password.
              </div>
            ) : null}

            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <Button className="w-full" type="submit">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mx-auto w-full max-w-sm border-border/60 bg-card/82 lg:mx-0 lg:max-w-none">
          <CardHeader className="pb-2">
            <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="eyebrow-label">Demo Access</p>
            <CardTitle>Try the dashboard instantly</CardTitle>
            <CardDescription>
              Use the following test account to explore the dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-5">
            <div className="surface-tile space-y-3 px-4 py-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Email
                </p>
                <p className="break-all text-sm font-medium">
                  rizwankabirsizan@gmail.com
                </p>
              </div>

              <div className="soft-divider" />

              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Password
                </p>
                <p className="text-sm font-medium">Sizan@1234</p>
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-border/60 bg-muted/34 px-4 py-3 text-sm text-muted-foreground">
              This account is provided for guided product review and testing. It
              does not autofill the sign-in form.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
