import { render, screen } from "@testing-library/react"

import { DeliveryOverviewCards } from "@/features/deliveries/delivery-overview-cards"

describe("DeliveryOverviewCards", () => {
  it("renders top-level delivery summary cards", () => {
    render(
      <DeliveryOverviewCards
        insights={{
          totalDeliveries: 8,
          pendingDeliveries: 2,
          shippedDeliveries: 2,
          deliveredDeliveries: 3,
          cancelledDeliveries: 1,
          nonCancelledDeliveries: 7,
          completionRate: 42.8,
          businessPaidDeliveryCost: 420,
          customerPaidDeliveryCost: 140,
          averageDeliveryCost: 80,
          customerPaidDeliveryPercentage: 25,
        }}
      />,
    )

    expect(screen.getByText("Pending Deliveries")).toBeInTheDocument()
    expect(screen.getByText("Shipped Deliveries")).toBeInTheDocument()
    expect(screen.getByText("Delivered Deliveries")).toBeInTheDocument()
    expect(screen.getByText("Cancelled Deliveries")).toBeInTheDocument()
    expect(screen.getByText("৳420")).toBeInTheDocument()
  })
})
