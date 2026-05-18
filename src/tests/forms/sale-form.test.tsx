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

import { fireEvent, render, screen } from "@testing-library/react"

import { SaleForm } from "@/features/sales/sale-form"

jest.mock("@/features/sales/sale-actions", () => ({
  createSale: jest.fn(),
}))

const products = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Soap",
    sku: "SOAP-01",
    suggested_selling_price_bdt: 1200,
    bangladeshStock: 9,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Cream",
    sku: "CRM-01",
    suggested_selling_price_bdt: 800,
    bangladeshStock: 4,
  },
]

const customers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Rahim Traders",
    phone: "+8801712345678",
    city: "Dhaka",
  },
]

describe("SaleForm", () => {
  it("renders one initial item and existing customer search", () => {
    render(<SaleForm products={products} customers={customers} />)

    expect(screen.getByLabelText("Search customer")).toBeInTheDocument()
    expect(screen.getByLabelText("Product 1")).toBeInTheDocument()
    expect(screen.getByText("Total revenue")).toBeInTheDocument()
  })

  it("can add another product row", () => {
    render(<SaleForm products={products} customers={customers} />)

    fireEvent.click(screen.getByRole("button", { name: /add product/i }))

    expect(screen.getByLabelText("Product 2")).toBeInTheDocument()
  })

  it("validates missing product on submit", async () => {
    render(<SaleForm products={products} customers={customers} />)

    fireEvent.change(screen.getByLabelText("Sale date"), {
      target: { value: "2026-05-06" },
    })
    fireEvent.click(screen.getByRole("button", { name: /rahim traders/i }))
    fireEvent.click(screen.getByRole("button", { name: /^record sale$/i }))

    expect(await screen.findByText("Product is required")).toBeInTheDocument()
  })

  it("shows order total summary", () => {
    render(<SaleForm products={products} customers={customers} />)

    fireEvent.change(screen.getByLabelText("Product 1"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440000" },
    })
    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "2" },
    })
    fireEvent.change(screen.getByLabelText("Unit price BDT"), {
      target: { value: "1000" },
    })
    fireEvent.change(screen.getByLabelText("Discount"), {
      target: { value: "100" },
    })

    expect(screen.getByText("৳2,000")).toBeInTheDocument()
    expect(screen.getByText("৳100")).toBeInTheDocument()
    expect(screen.getAllByText("৳1,900").length).toBeGreaterThan(0)
  })

  it("renders inline new customer fields when toggled", () => {
    render(<SaleForm products={products} customers={customers} />)

    fireEvent.click(screen.getByRole("button", { name: /new customer/i }))

    expect(screen.getByLabelText("Customer name")).toBeInTheDocument()
    expect(screen.getByLabelText("Customer phone")).toBeInTheDocument()
    expect(screen.getByLabelText("Customer address")).toBeInTheDocument()
    expect(screen.getByLabelText("Notes")).toBeInTheDocument()
  })
})
