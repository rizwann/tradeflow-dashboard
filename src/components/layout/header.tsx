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
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <MobileNav role={role} />

        <div>
          <p className="text-sm font-medium">{fullName}</p>
          <p className="text-xs capitalize text-muted-foreground">{role}</p>
        </div>
      </div>

      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          Logout
        </Button>
      </form>
    </header>
  )
}
