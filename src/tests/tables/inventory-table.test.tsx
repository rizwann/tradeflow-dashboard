import { render, screen } from "@testing-library/react"

import { InventoryTable } from "@/features/inventory/inventory-table"

describe("InventoryTable", () => {
  it("renders stock values and status", () => {
    render(
      <InventoryTable
        rows={[
          {
            productId: "1",
            productName: "Soap",
            sku: "SKU-1",
            germany: 10,
            inTransit: 2,
            bangladesh: 3,
            total: 15,
          },
        ]}
      />,
    )

    expect(screen.getByText("Soap")).toBeInTheDocument()
    expect(screen.getByText("Healthy")).toBeInTheDocument()
  })
})
