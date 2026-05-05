import { Badge } from "@/components/ui/badge"

type StatusBadgeProps = {
  status: "healthy" | "low" | "out"
}

const statusConfig = {
  healthy: {
    label: "Healthy",
    className:
      "border-emerald-200/80 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  low: {
    label: "Low stock",
    className:
      "border-amber-200/80 bg-amber-500/10 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300",
  },
  out: {
    label: "Out of stock",
    className:
      "border-red-200/80 bg-red-500/10 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300",
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge className={config.className} variant="outline">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
