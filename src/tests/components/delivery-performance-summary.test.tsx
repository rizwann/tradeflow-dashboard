import { render, screen } from "@testing-library/react"

import { DeliveryPerformanceSummary } from "@/features/reports/delivery-performance-summary"

describe("DeliveryPerformanceSummary", () => {
  it("renders delivery summary metrics and status counts", () => {
    render(
      <DeliveryPerformanceSummary
        insights={{
          totalDeliveries: 10,
          pendingDeliveries: 2,
          shippedDeliveries: 3,
          deliveredDeliveries: 4,
          cancelledDeliveries: 1,
          nonCancelledDeliveries: 9,
          completionRate: 44.4,
          businessPaidDeliveryCost: 600,
          customerPaidDeliveryCost: 250,
          averageDeliveryCost: 94.4,
          customerPaidDeliveryPercentage: 40,
        }}
      />,
    )

    expect(screen.getByText("Total Deliveries")).toBeInTheDocument()
    expect(screen.getByText("10")).toBeInTheDocument()
    expect(screen.getByText("৳600")).toBeInTheDocument()
    expect(screen.getByText("৳250")).toBeInTheDocument()
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Delivered").length).toBeGreaterThan(0)
  })
})
