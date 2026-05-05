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
    <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-background lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="font-bold">
          TradeFlow
        </Link>
      </div>

      <nav className="space-y-1 p-4">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-muted text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
