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

import { SaleTable, type SaleTableRow } from "@/features/sales/sale-table"

function createBaseSaleRow(overrides: Partial<SaleTableRow> = {}): SaleTableRow {
  return {
    id: "sale-1",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Soap",
        productSku: "SOAP-01",
        quantity: 1,
        unitSellingPriceBdt: 1200,
        discount: 0,
        revenue: 1200,
      },
    ],
    itemSummary: "Soap x1",
    itemCount: 1,
    totalQuantity: 1,
    totalRevenue: 1200,
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
    paymentStatus: "paid",
    saleDate: "2026-05-06",
    soldBy: "user-1",
    status: "active",
    voidedAt: null,
    voidReason: null,
    ...overrides,
  }
}

describe("SaleTable", () => {
  it("renders a single-item order with a linked product and no unit price column", () => {
    render(
      <SaleTable
        sales={[createBaseSaleRow()]}
        currentUserId="admin-1"
        currentUserRole="admin"
      />,
    )

    expect(screen.getAllByRole("link", { name: /view product details for soap/i })[0]).toHaveAttribute(
      "href",
      "/products/prod-1",
    )
    expect(screen.getAllByText("Rahim Traders").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Manage delivery").length).toBeGreaterThan(0)
    expect(screen.queryByText(/unit price/i)).not.toBeInTheDocument()
  })

  it("renders multi-item orders with multiple product links, +N more, and summed revenue", () => {
    render(
      <SaleTable
        sales={[
          createBaseSaleRow({
            items: [
              {
                id: "item-1",
                productId: "prod-1",
                productName: "Soap",
                productSku: "SOAP-01",
                quantity: 2,
                unitSellingPriceBdt: 1000,
                discount: 50,
                revenue: 1950,
              },
              {
                id: "item-2",
                productId: "prod-2",
                productName: "Cream",
                productSku: "CRM-01",
                quantity: 1,
                unitSellingPriceBdt: 500,
                discount: 0,
                revenue: 500,
              },
              {
                id: "item-3",
                productId: "prod-3",
                productName: "Lotion",
                productSku: "LOT-01",
                quantity: 4,
                unitSellingPriceBdt: 250,
                discount: 0,
                revenue: 1000,
              },
            ],
            itemSummary: "Soap x2; Cream x1; Lotion x4",
            itemCount: 3,
            totalQuantity: 7,
            totalRevenue: 3450,
          }),
        ]}
        currentUserId="admin-1"
        currentUserRole="admin"
      />,
    )

    expect(screen.getAllByRole("link", { name: /view product details for soap/i })[0]).toHaveAttribute(
      "href",
      "/products/prod-1",
    )
    expect(screen.getAllByRole("link", { name: /view product details for cream/i })[0]).toHaveAttribute(
      "href",
      "/products/prod-2",
    )
    expect(screen.getAllByText("+1 more").length).toBeGreaterThan(0)
    expect(screen.getAllByText("৳3,450").length).toBeGreaterThan(0)
    expect(
      screen.getAllByRole("button", {
        name: /void sale for soap, cream and 1 more item/i,
      }).length,
    ).toBeGreaterThan(0)
  })

  it("shows voided state and reason for voided sales", () => {
    render(
      <SaleTable
        sales={[
          createBaseSaleRow({
            customerId: null,
            customerName: null,
            customerPhone: null,
            deliveryId: null,
            deliveryStatus: null,
            deliveryMethod: null,
            deliveryTrackingNumber: null,
            deliveryCost: null,
            deliveryCostPaidBy: null,
            deliveryCreatedBy: null,
            status: "voided",
            voidedAt: "2026-05-07",
            voidReason: "Duplicate",
          }),
        ]}
        currentUserId="user-1"
        currentUserRole="partner"
      />,
    )

    expect(screen.getAllByText("Voided").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Reason: Duplicate").length).toBeGreaterThan(0)
  })
})
