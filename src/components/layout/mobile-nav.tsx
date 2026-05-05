"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { navItems, type UserRole } from "@/types/app"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type MobileNavProps = {
  role: UserRole
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname()

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="h-10 w-10 rounded-xl border-border/80 bg-card/80 shadow-sm lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[85vw] max-w-80 border-sidebar-border bg-sidebar text-sidebar-foreground"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <span className="text-sm font-semibold tracking-[0.2em]">TF</span>
            </div>
            <div className="text-left">
              <span className="block">TradeFlow</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Operations dashboard
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-4 space-y-1 px-2 pb-4">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isActive
                    ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-sidebar-primary" : "text-muted-foreground",
                  )}
                />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
