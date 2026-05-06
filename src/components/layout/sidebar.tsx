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
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 px-4 py-4 text-sidebar-foreground lg:block">
      <div className="flex h-full flex-col rounded-[2rem] border border-sidebar-border/70 bg-sidebar/88 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.28)]">
        <div className="flex h-24 items-center border-b border-sidebar-border/70 px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-3xl transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_14px_30px_color-mix(in_oklab,var(--sidebar-primary)_28%,transparent)]">
              <div className="absolute inset-[1px] rounded-[calc(theme(borderRadius.2xl)-1px)] border border-white/12" />
              <span className="text-sm font-semibold tracking-[0.2em]">TF</span>
            </div>
            <div>
              <p className="font-semibold tracking-tight">TradeFlow</p>
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Operations
              </p>
            </div>
          </Link>
        </div>

        <div className="px-4 pt-5">
          <div className="rounded-3xl border border-sidebar-border/60 bg-sidebar-accent/60 px-4 py-4">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Control Center
            </p>
            <p className="mt-2 text-sm leading-6 text-sidebar-accent-foreground/90">
              Inventory, finance, and shipment operations in one workspace.
            </p>
          </div>
        </div>

        <nav className="space-y-2 px-4 py-5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:border-sidebar-border/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
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
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                  )}
                />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
