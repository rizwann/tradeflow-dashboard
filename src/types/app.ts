import {
  BarChart3,
  Boxes,
  ClipboardList,
  Home,
  Package,
  Plane,
  Receipt,
  ShoppingCart,
  Wallet,
} from "lucide-react"

export type UserRole = "admin" | "partner"

export type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "partner"],
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
    roles: ["admin"],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Boxes,
    roles: ["admin", "partner"],
  },
  {
    title: "Purchases",
    href: "/purchases",
    icon: ClipboardList,
    roles: ["admin"],
  },
  {
    title: "Shipments",
    href: "/shipments",
    icon: Plane,
    roles: ["admin", "partner"],
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["admin", "partner"],
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
    roles: ["admin", "partner"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "partner"],
  },
  {
    title: "Accounting",
    href: "/accounting",
    icon: Wallet,
    roles: ["admin"],
  },
]
