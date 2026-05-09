"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems, type UserRole } from "@/types/app"
import { cn } from "@/lib/utils"

type SidebarProps = {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="sticky top-0 hidden h-screen w-[21rem] shrink-0 px-4 py-4 text-sidebar-foreground lg:block">
      <div className="surface-panel flex h-full flex-col bg-sidebar/82 text-sidebar-foreground">
        <div
          aria-hidden="true"
          className="surface-orb -left-10 top-0 h-36 w-36 bg-primary/14"
        />
        <div className="flex h-28 items-center border-b border-sidebar-border/70 px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-3xl transition-[transform,color] duration-150 hover:translate-x-0.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <div className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-[1.45rem] bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_18px_36px_color-mix(in_oklab,var(--sidebar-primary)_28%,transparent)]">
              <div className="absolute inset-[1px] rounded-[calc(theme(borderRadius.2xl)-1px)] border border-white/12" />
              <span className="text-sm font-semibold tracking-[0.22em]">TF</span>
            </div>
            <div>
              <p className="font-semibold tracking-[-0.03em]">TradeFlow</p>
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Operations Platform
              </p>
            </div>
          </Link>
        </div>

        <div className="px-4 pt-5">
          <div className="surface-panel-subtle rounded-[1.7rem] bg-sidebar-accent/54 px-4 py-4">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Control Center
            </p>
            <p className="mt-2 text-sm leading-6 text-sidebar-accent-foreground/90">
              Inventory, finance, and shipment operations in one workspace.
            </p>
          </div>
        </div>

        <div className="px-4 pt-6">
          <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Platform Navigation
          </p>
        </div>

        <nav className="space-y-2 px-4 py-4">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[1.3rem] border px-4 py-3.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-sidebar-border/80 hover:bg-sidebar-accent/72 hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isActive
                    ? "border-sidebar-border/80 bg-sidebar-accent/92 text-sidebar-accent-foreground shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                    : "border-transparent",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-3 left-2 w-1 rounded-full transition-colors",
                    isActive ? "bg-sidebar-primary" : "bg-transparent",
                  )}
                />
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                  )}
                />
                <span className="tracking-[-0.01em]">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
