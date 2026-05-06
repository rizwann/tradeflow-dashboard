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

import { PurchaseForm } from "@/features/purchases/purchase-form"

jest.mock("@/features/purchases/purchase-actions", () => ({
  createPurchase: jest.fn(),
}))

const products = [
  { id: "550e8400-e29b-41d4-a716-446655440000", name: "Soap" },
]

describe("PurchaseForm", () => {
  it("renders submit button and product options", () => {
    render(<PurchaseForm products={products} />)

    expect(screen.getByRole("button", { name: "Record purchase" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Soap" })).toBeInTheDocument()
  })

  it("renders quantity and date fields", () => {
    render(<PurchaseForm products={products} />)

    expect(screen.getByLabelText("Quantity")).toBeInTheDocument()
    expect(screen.getByLabelText("Purchase date")).toBeInTheDocument()
  })
})
