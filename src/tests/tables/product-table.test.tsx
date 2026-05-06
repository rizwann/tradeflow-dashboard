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

    expect(screen.getByText("Soap")).toBeInTheDocument()
    expect(screen.getByText("€10.00")).toBeInTheDocument()
    expect(screen.getByLabelText("Edit product Soap")).toBeInTheDocument()
  })

  it("renders empty state", () => {
    render(<ProductTable products={[]} />)
    expect(screen.getByText("No products yet")).toBeInTheDocument()
  })
})
