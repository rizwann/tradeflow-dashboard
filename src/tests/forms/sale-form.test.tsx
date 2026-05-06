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

import { SaleForm } from "@/features/sales/sale-form"

jest.mock("@/features/sales/sale-actions", () => ({
  createSale: jest.fn(),
}))

const products = [
  { id: "550e8400-e29b-41d4-a716-446655440000", name: "Soap" },
]

describe("SaleForm", () => {
  it("renders payment status options", () => {
    render(<SaleForm products={products} />)

    expect(screen.getByRole("option", { name: "Paid" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Partial" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Unpaid" })).toBeInTheDocument()
  })

  it("renders customer and notes inputs", () => {
    render(<SaleForm products={products} />)

    expect(screen.getByLabelText("Customer name")).toBeInTheDocument()
    expect(screen.getByLabelText("Notes")).toBeInTheDocument()
  })
})
