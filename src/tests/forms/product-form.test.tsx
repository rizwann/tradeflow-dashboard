jest.mock("react", () => {
  const actual = jest.requireActual("react")

  return {
    ...actual,
    useActionState: jest.fn(() => [
      { success: false, message: "" },
      jest.fn(),
      false,
    ]),
  }
})

import { render, screen } from "@testing-library/react"

import { ProductForm } from "@/features/products/product-form"

jest.mock("@/features/products/product-actions", () => ({
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
}))

describe("ProductForm", () => {
  it("shows validation errors for required fields", async () => {
    render(<ProductForm mode="create" />)

    expect(screen.getByLabelText("Product name")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save product" })).toBeInTheDocument()
  })

  it("renders edit defaults and update button", () => {
    render(
      <ProductForm
        mode="edit"
        product={{
          id: "1",
          name: "Soap",
          brand: "Brand",
          category: "Care",
          sku: "SKU-1",
          purchase_price_eur: 10,
          exchange_rate: 130,
          suggested_selling_price_bdt: 1500,
          image_url: "",
          notes: "Note",
        }}
      />,
    )

    expect(screen.getByDisplayValue("Soap")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Update product" })).toBeInTheDocument()
  })
})
