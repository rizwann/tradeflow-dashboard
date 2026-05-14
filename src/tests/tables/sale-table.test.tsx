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
