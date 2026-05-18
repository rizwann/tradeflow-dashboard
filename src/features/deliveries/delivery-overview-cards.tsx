import { MetricCard } from "@/components/shared/metric-card"
import type { DeliveryInsights } from "@/features/analytics/customer-delivery-analytics"

type DeliveryOverviewCardsProps = {
  insights: DeliveryInsights
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

export function DeliveryOverviewCards({
  insights,
}: DeliveryOverviewCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        title="Pending Deliveries"
        value={insights.pendingDeliveries.toLocaleString("en-US")}
        description="Orders waiting to leave fulfilment."
      />
      <MetricCard
        title="Shipped Deliveries"
        value={insights.shippedDeliveries.toLocaleString("en-US")}
        description="Orders currently in transit."
      />
      <MetricCard
        title="Delivered Deliveries"
        value={insights.deliveredDeliveries.toLocaleString("en-US")}
        description="Completed handoffs."
      />
      <MetricCard
        title="Cancelled Deliveries"
        value={insights.cancelledDeliveries.toLocaleString("en-US")}
        description="Cancelled records kept for audit visibility."
      />
      <MetricCard
        title="Business Delivery Cost"
        value={formatBDT(insights.businessPaidDeliveryCost)}
        description="Non-cancelled business-paid delivery cost."
      />
    </section>
  )
}
