import { logout } from "@/app/(app)/actions"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/layout/mobile-nav"
import type { UserRole } from "@/types/app"

type HeaderProps = {
  fullName: string
  role: UserRole
}

export function Header({ fullName, role }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 min-w-0 items-center justify-between gap-3 border-b bg-background/95 px-3 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav role={role} />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{fullName}</p>
          <p className="truncate text-xs capitalize text-muted-foreground">
            {role}
          </p>
        </div>
      </div>

      <form action={logout}>
        <Button
          type="submit"
          variant="outline"
          className="h-9 px-3 text-sm sm:h-8 sm:px-2.5 sm:text-[0.8rem]"
        >
          Logout
        </Button>
      </form>
    </header>
  )
}
