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

import { InventoryAdjustmentForm } from "@/features/inventory/inventory-adjustment-form"

jest.mock("@/features/inventory/inventory-actions", () => ({
  adjustInventory: jest.fn(),
}))

const products = [{ id: "p-1", name: "Soap", sku: "SKU-1" }]

describe("InventoryAdjustmentForm", () => {
  it("locks partner location to bangladesh and shows warning", () => {
    render(
      <InventoryAdjustmentForm
        products={products}
        currentUserRole="partner"
      />,
    )

    expect(screen.getByLabelText("Location")).toBeDisabled()
    expect(
      screen.getByText(/manual bangladesh stock changes may affect fifo cost accuracy/i),
    ).toBeInTheDocument()
  })

  it("renders admin location choices", () => {
    render(
      <InventoryAdjustmentForm
        products={products}
        currentUserRole="admin"
      />,
    )

    expect(screen.getByRole("option", { name: "Germany" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save adjustment" })).toBeInTheDocument()
  })
})
