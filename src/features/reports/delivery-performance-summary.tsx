import { MetricCard } from "@/components/shared/metric-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DeliveryInsights } from "@/features/analytics/customer-delivery-analytics"

type DeliveryPerformanceSummaryProps = {
  insights: DeliveryInsights
}

const deliveryStatusOrder = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
] as const

const deliveryStatusMeta = {
  pending: {
    label: "Pending",
    barClassName: "bg-amber-500/80 dark:bg-amber-400/80",
    badgeClassName:
      "border-amber-200/80 bg-amber-500/10 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300",
  },
  shipped: {
    label: "Shipped",
    barClassName: "bg-sky-500/80 dark:bg-sky-400/80",
    badgeClassName:
      "border-sky-200/80 bg-sky-500/10 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300",
  },
  delivered: {
    label: "Delivered",
    barClassName: "bg-emerald-500/80 dark:bg-emerald-400/80",
    badgeClassName:
      "border-emerald-200/80 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    barClassName: "bg-red-500/80 dark:bg-red-400/80",
    badgeClassName:
      "border-red-200/80 bg-red-500/10 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300",
  },
} satisfies Record<
  typeof deliveryStatusOrder[number],
  {
    label: string
    barClassName: string
    badgeClassName: string
  }
>

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function getCountForStatus(
  insights: DeliveryInsights,
  status: (typeof deliveryStatusOrder)[number],
) {
  if (status === "pending") return insights.pendingDeliveries
  if (status === "shipped") return insights.shippedDeliveries
  if (status === "delivered") return insights.deliveredDeliveries

  return insights.cancelledDeliveries
}

export function DeliveryPerformanceSummary({
  insights,
}: DeliveryPerformanceSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Deliveries"
          value={insights.totalDeliveries.toLocaleString("en-US")}
          description="All delivery records, including cancelled."
        />
        <MetricCard
          title="Completion Rate"
          value={formatPercent(insights.completionRate)}
          description="Delivered share of non-cancelled deliveries."
        />
        <MetricCard
          title="Business Delivery Cost"
          value={formatBDT(insights.businessPaidDeliveryCost)}
          description="Included in net profit reduction."
        />
        <MetricCard
          title="Customer Delivery Cost"
          value={formatBDT(insights.customerPaidDeliveryCost)}
          description="Informational only and excluded from net profit."
        />
        <MetricCard
          title="Average Delivery Cost"
          value={formatBDT(insights.averageDeliveryCost)}
          description="Average across non-cancelled deliveries."
        />
      </div>

      <Card className="border-border/60 bg-card/78">
        <CardHeader className="pb-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Delivery Completion Summary
          </p>
          <CardTitle>Status mix</CardTitle>
          <CardDescription>
            Pending, shipped, delivered, and cancelled distribution across delivery records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="surface-panel-subtle rounded-[1.45rem] p-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted/80">
              {deliveryStatusOrder.map((status) => {
                const count = getCountForStatus(insights, status)
                const width =
                  insights.totalDeliveries === 0
                    ? 0
                    : (count / insights.totalDeliveries) * 100

                return (
                  <div
                    key={status}
                    className={deliveryStatusMeta[status].barClassName}
                    style={{ width: `${width}%` }}
                  />
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {deliveryStatusOrder.map((status) => (
              <div
                key={status}
                className="surface-tile flex items-center justify-between gap-3 px-4 py-3"
              >
                <Badge
                  variant="outline"
                  className={deliveryStatusMeta[status].badgeClassName}
                >
                  {deliveryStatusMeta[status].label}
                </Badge>
                <p className="text-sm font-semibold">
                  {getCountForStatus(insights, status).toLocaleString("en-US")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
