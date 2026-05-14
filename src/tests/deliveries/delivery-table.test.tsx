jest.mock("@/features/deliveries/delivery-table-actions", () => ({
  DeliveryTableActions: ({
    delivery,
    saleStatus,
  }: {
    delivery?: { status: string } | null
    saleStatus: string
  }) => (
    <div>
      <span>{delivery ? "Manage delivery" : "Add delivery"}</span>
      <span>{saleStatus}</span>
    </div>
  ),
}))

import { render, screen } from "@testing-library/react"

import { DeliveryTable } from "@/features/deliveries/delivery-table"

describe("DeliveryTable", () => {
  it("renders delivery rows and actions", () => {
    render(
      <DeliveryTable
        deliveries={[
          {
            id: "del-1",
            saleId: "sale-1",
            saleStatus: "active",
            customerId: "cust-1",
            customerName: "Rahim Traders",
            customerPhone: "+8801712345678",
            productName: "Soap",
            saleDate: "2026-05-14",
            status: "pending",
            deliveryMethod: "Pathao",
            trackingNumber: "TRK-001",
            deliveryCost: 80,
            deliveryCostPaidBy: "business",
            shippedAt: null,
            deliveredAt: null,
            notes: null,
            soldBy: "user-1",
            customerCreatedBy: "user-1",
            deliveryCreatedBy: "user-1",
          },
        ]}
        currentUserId="user-1"
        currentUserRole="partner"
      />,
    )

    expect(screen.getAllByText("Rahim Traders").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Manage delivery").length).toBeGreaterThan(0)
  })

  it("renders empty state", () => {
    render(
      <DeliveryTable
        deliveries={[]}
        currentUserId="user-1"
        currentUserRole="partner"
      />,
    )

    expect(screen.getByText("No deliveries yet")).toBeInTheDocument()
  })
})
