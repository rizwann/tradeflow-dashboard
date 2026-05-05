import { logout } from "@/app/(app)/actions"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types/app"

type HeaderProps = {
  fullName: string
  role: UserRole
}

export function Header({ fullName, role }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 min-w-0 items-center justify-between gap-3 border-b border-border/70 bg-background/88 px-3 backdrop-blur-xl sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav role={role} />

        <div className="min-w-0 rounded-2xl border border-transparent px-1 py-0.5">
          <p className="truncate text-sm font-medium tracking-tight">
            {fullName}
          </p>
          <p className="truncate text-xs capitalize text-muted-foreground">
            {role}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="h-9 rounded-xl border-border/80 bg-card/80 px-3 text-sm shadow-sm hover:bg-muted/80"
            aria-label="Log out of TradeFlow"
          >
            Logout
          </Button>
        </form>
      </div>
    </header>
  )
}
