import { render, screen } from "@testing-library/react"

import { PurchaseTable } from "@/features/purchases/purchase-table"

describe("PurchaseTable", () => {
  it("renders formatted purchase values", () => {
    render(
      <PurchaseTable
        purchases={[
          {
            id: "1",
            productName: "Soap",
            quantity: 2,
            unitCostEur: 4.5,
            exchangeRate: 130,
            totalCostBdt: 1170,
            purchaseDate: "2026-05-06",
          },
        ]}
      />,
    )

    expect(screen.getByText("Soap")).toBeInTheDocument()
    expect(screen.getByText("€4.50")).toBeInTheDocument()
    expect(screen.getByText("৳1,170")).toBeInTheDocument()
  })
})
