jest.mock("@/features/sales/sale-table-actions", () => ({
  SaleTableActions: ({
    saleStatus,
    productName,
  }: {
    saleStatus: "active" | "voided"
    productName: string
  }) =>
    saleStatus === "active" ? (
      <button aria-label={`Void sale for ${productName}`}>Void</button>
    ) : (
      <span>Voided</span>
    ),
}))

jest.mock("@/features/deliveries/delivery-table-actions", () => ({
  DeliveryTableActions: ({
    delivery,
  }: {
    delivery?: { status: string } | null
  }) => <span>{delivery ? "Manage delivery" : "Add delivery"}</span>,
}))

import { render, screen } from "@testing-library/react"

import { SaleTable } from "@/features/sales/sale-table"

describe("SaleTable", () => {
  it("shows void action for active admin-visible sale", () => {
    render(
      <SaleTable
        sales={[
          {
            id: "1",
            productName: "Soap",
            customerId: "cust-1",
            customerName: "Rahim Traders",
            customerPhone: "+8801712345678",
            customerCreatedBy: null,
            deliveryId: "del-1",
            deliveryStatus: "pending",
            deliveryMethod: "Pathao",
            deliveryTrackingNumber: "TRK-001",
            deliveryCost: 80,
            deliveryCostPaidBy: "business",
            deliveryShippedAt: null,
            deliveryDeliveredAt: null,
            deliveryNotes: null,
            deliveryCreatedBy: "user-1",
            quantity: 1,
            unitSellingPriceBdt: 1200,
            discount: 0,
            revenue: 1200,
            paymentStatus: "paid",
            saleDate: "2026-05-06",
            soldBy: "user-1",
            status: "active",
            voidedAt: null,
            voidReason: null,
          },
        ]}
        currentUserId="admin-1"
        currentUserRole="admin"
      />,
    )

    expect(screen.getAllByRole("button", { name: /void sale for soap/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Rahim Traders").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Manage delivery").length).toBeGreaterThan(0)
  })

  it("shows voided state and reason for voided sales", () => {
    render(
      <SaleTable
        sales={[
          {
            id: "1",
            productName: "Soap",
            customerId: null,
            customerName: null,
            customerPhone: null,
            customerCreatedBy: null,
            deliveryId: null,
            deliveryStatus: null,
            deliveryMethod: null,
            deliveryTrackingNumber: null,
            deliveryCost: null,
            deliveryCostPaidBy: null,
            deliveryShippedAt: null,
            deliveryDeliveredAt: null,
            deliveryNotes: null,
            deliveryCreatedBy: null,
            quantity: 1,
            unitSellingPriceBdt: 1200,
            discount: 0,
            revenue: 1200,
            paymentStatus: "paid",
            saleDate: "2026-05-06",
            soldBy: "user-1",
            status: "voided",
            voidedAt: "2026-05-07",
            voidReason: "Duplicate",
          },
        ]}
        currentUserId="user-1"
        currentUserRole="partner"
      />,
    )

    expect(screen.getAllByText("Voided").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Reason: Duplicate").length).toBeGreaterThan(0)
  })
})
