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
  { id: "550e8400-e29b-41d4-a716-446655440000", name: "Soap" },
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
  it("renders payment status options and existing customer search", () => {
    render(<SaleForm products={products} customers={customers} />)

    expect(screen.getByRole("option", { name: "Paid" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Partial" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Unpaid" })).toBeInTheDocument()
    expect(screen.getByLabelText("Search customer")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /rahim traders/i })).toBeInTheDocument()
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
