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
    <header className="sticky top-0 z-40 min-w-0 border-b border-border/50 bg-background/72 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 min-w-0 max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-4 lg:h-[4.5rem] lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav role={role} />

          <div className="min-w-0 rounded-2xl border border-border/50 bg-card/65 px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:bg-card/50">
            <p className="truncate text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              TradeFlow Workspace
            </p>
            <div className="mt-0.5 flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold tracking-tight sm:text-[0.95rem]">
                {fullName}
              </p>
              <span
                aria-hidden="true"
                className="h-1 w-1 shrink-0 rounded-full bg-primary/60"
              />
              <p className="truncate text-xs capitalize text-muted-foreground">
                {role}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="h-9 rounded-2xl border-border/60 bg-card/70 px-3 text-sm hover:bg-muted/80"
              aria-label="Log out of TradeFlow"
            >
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
