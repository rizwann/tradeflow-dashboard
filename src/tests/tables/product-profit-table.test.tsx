import { render, screen } from "@testing-library/react"

import { ProductProfitTable } from "@/features/reports/product-profit-table"

describe("ProductProfitTable", () => {
  it("renders rows and formatted values", () => {
    render(
      <ProductProfitTable
        rows={[
          {
            productId: "1",
            productName: "Soap",
            quantitySold: 10,
            revenue: 1000,
            landedCostTotal: 700,
            grossProfit: 300,
            margin: 30,
          },
        ]}
      />,
    )

    expect(screen.getAllByText("Soap").length).toBeGreaterThan(0)
    expect(screen.getAllByText("30.0%").length).toBeGreaterThan(0)
  })

  it("renders empty state", () => {
    render(<ProductProfitTable rows={[]} />)
    expect(screen.getByText("No sales data yet")).toBeInTheDocument()
  })
})
