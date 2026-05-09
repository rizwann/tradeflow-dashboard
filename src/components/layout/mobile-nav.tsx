"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { navItems, type UserRole } from "@/types/app"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
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
  const [open, setOpen] = useState(false)

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="h-10 w-10 rounded-[1.1rem] border-border/60 bg-card/72 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[85vw] max-w-80 border-sidebar-border/70 bg-sidebar/95 text-sidebar-foreground"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_14px_30px_color-mix(in_oklab,var(--sidebar-primary)_28%,transparent)]">
              <span className="text-sm font-semibold tracking-[0.2em]">TF</span>
            </div>
            <div className="text-left">
              <span className="block">TradeFlow</span>
              <span className="block text-xs font-normal tracking-[0.18em] text-muted-foreground uppercase">
                Operations Platform
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pt-2">
          <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Navigation
          </p>
        </div>

        <nav className="mt-3 space-y-2 px-3 pb-4">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-11 items-center gap-3 rounded-[1.2rem] border px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-sidebar-border/80 hover:bg-sidebar-accent/72 hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    isActive
                      ? "border-sidebar-border/80 bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                      : "border-transparent",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-3 left-1.5 w-1 rounded-full transition-colors",
                      isActive ? "bg-sidebar-primary" : "bg-transparent",
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive
                        ? "text-sidebar-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  {item.title}
                </Link>
              </SheetClose>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
