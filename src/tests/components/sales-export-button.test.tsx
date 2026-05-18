import { fireEvent, render, screen } from "@testing-library/react"

import { SalesExportButton } from "@/features/sales/sales-export-button"

jest.mock("@/lib/download", () => ({
  downloadCsv: jest.fn(),
}))

const { downloadCsv } = jest.requireMock("@/lib/download") as {
  downloadCsv: jest.Mock
}

describe("SalesExportButton", () => {
  beforeEach(() => {
    downloadCsv.mockReset()
  })

  it("exports item summaries and order totals instead of unit price", () => {
    render(
      <SalesExportButton
        rows={[
          {
            items_summary: "Soap x2; Cream x1",
            item_count: 2,
            total_quantity: 3,
            total_revenue: 2450,
            sale_date: "2026-05-06",
            payment_status: "paid",
            status: "active",
            customer_name: "Rahim Traders",
            customer_phone: "+8801712345678",
            delivery_status: "pending",
            delivery_cost: 80,
            delivery_cost_paid_by: "business",
          },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /export csv/i }))

    expect(downloadCsv).toHaveBeenCalledWith(
      "tradeflow-sales.csv",
      expect.stringContaining(
        "Items Summary,Item Count,Total Quantity,Total Revenue,Customer Name,Customer Phone,Payment Status,Delivery Status,Sale Status,Sale Date,Delivery Cost,Delivery Cost Paid By",
      ),
    )
    expect(downloadCsv).toHaveBeenCalledWith(
      "tradeflow-sales.csv",
      expect.stringContaining(
        "Soap x2; Cream x1,2,3,2450,Rahim Traders,+8801712345678,paid,pending,active,2026-05-06,80,business",
      ),
    )
  })
})
