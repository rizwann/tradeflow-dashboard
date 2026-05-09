import { render, screen } from "@testing-library/react"

import { ProductTable } from "@/features/products/product-table"

describe("ProductTable", () => {
  it("renders product rows and edit action", () => {
    render(
      <ProductTable
        products={[
          {
            id: "1",
            name: "Soap",
            brand: "Brand",
            category: "Care",
            sku: "SKU-1",
            purchase_price_eur: 10,
            purchase_price_bdt: 1300,
            suggested_selling_price_bdt: 1700,
          },
        ]}
      />,
    )

    expect(screen.getAllByText("Soap").length).toBeGreaterThan(0)
    expect(screen.getAllByText("€10.00").length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText("Edit product Soap").length).toBeGreaterThan(0)
  })

  it("renders empty state", () => {
    render(<ProductTable products={[]} />)
    expect(screen.getByText("No products yet")).toBeInTheDocument()
  })
})
