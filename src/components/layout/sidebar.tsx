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
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
      <div className="flex h-20 items-center border-b border-sidebar-border px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-2xl transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <span className="text-sm font-semibold tracking-[0.2em]">TF</span>
          </div>
          <div>
            <p className="font-semibold tracking-tight">TradeFlow</p>
            <p className="text-xs text-muted-foreground">Operations dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1.5 p-4">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium text-muted-foreground transition-all duration-150 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isActive
                  ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "border-transparent",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                )}
              />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
