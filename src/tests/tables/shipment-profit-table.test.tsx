import { render, screen } from "@testing-library/react"

import { ShipmentProfitTable } from "@/features/reports/shipment-profit-table"

describe("ShipmentProfitTable", () => {
  it("renders shipment profit rows", () => {
    render(
      <ShipmentProfitTable
        rows={[
          {
            shipmentId: "1",
            shipmentCode: "SHP-1",
            totalQuantity: 20,
            estimatedRevenue: 5000,
            landedCost: 3200,
            grossProfit: 1800,
            margin: 36,
          },
        ]}
      />,
    )

    expect(screen.getByText("SHP-1")).toBeInTheDocument()
    expect(screen.getByText("36.0%")).toBeInTheDocument()
  })

  it("renders empty state", () => {
    render(<ShipmentProfitTable rows={[]} />)
    expect(screen.getByText("No shipment profitability yet")).toBeInTheDocument()
  })
})
