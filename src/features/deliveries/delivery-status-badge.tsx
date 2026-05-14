import { Badge } from "@/components/ui/badge"
import type { DeliveryStatus } from "./delivery-schema"

const deliveryStatusConfig: Record<
  DeliveryStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "border-amber-200/80 bg-amber-500/10 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300",
  },
  shipped: {
    label: "Shipped",
    className:
      "border-sky-200/80 bg-sky-500/10 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300",
  },
  delivered: {
    label: "Delivered",
    className:
      "border-emerald-200/80 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border-red-200/80 bg-red-500/10 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300",
  },
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const config = deliveryStatusConfig[status]

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
