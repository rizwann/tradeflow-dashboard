import { logout } from "@/app/(app)/actions"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types/app"

type HeaderProps = {
  fullName: string
  role: UserRole
}

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
}

export function Header({ fullName, role }: HeaderProps) {
  const initials = getInitials(fullName)

  return (
    <header className="sticky top-0 z-40 min-w-0 px-3 pt-3 sm:px-4 lg:px-6">
      <div className="surface-panel mx-auto flex h-16 min-w-0 max-w-[1640px] items-center justify-between gap-3 bg-background/68 px-3 sm:px-4 lg:h-[4.75rem] lg:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav role={role} />

          <div className="min-w-0">
            <p className="truncate text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              TradeFlow Workspace
            </p>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-primary/70 shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_34%,transparent)]"
              />
              <p className="truncate text-sm font-semibold tracking-[-0.02em] sm:text-[0.98rem]">
                Operations overview
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          <div className="surface-panel-subtle flex items-center gap-3 px-2.5 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[1rem] bg-primary/12 text-xs font-semibold tracking-[0.18em] text-primary">
              {initials}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold tracking-[-0.02em]">
                {fullName}
              </p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {role}
              </p>
            </div>
          </div>

          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="h-9 rounded-[1.1rem] border-border/60 bg-card/70 px-3.5 text-sm"
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
