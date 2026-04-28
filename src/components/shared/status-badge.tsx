import { Badge } from "@/components/ui/badge"

type StatusBadgeProps = {
  status: "healthy" | "low" | "out"
}

const statusConfig = {
  healthy: {
    label: "Healthy",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  low: {
    label: "Low stock",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  out: {
    label: "Out of stock",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return <Badge className={config.className}>{config.label}</Badge>
}
