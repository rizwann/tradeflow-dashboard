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
      screen.getByText(/bangladesh adjustments are fifo-aware/i),
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

  it("shows landed cost input for bangladesh increase and set adjustments", () => {
    render(
      <InventoryAdjustmentForm
        products={products}
        currentUserRole="admin"
      />,
    )

    fireEvent.change(screen.getByLabelText("Location"), {
      target: { value: "bangladesh" },
    })
    expect(
      screen.getByLabelText("Landed cost per unit"),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Adjustment type"), {
      target: { value: "decrease" },
    })
    expect(
      screen.queryByLabelText("Landed cost per unit"),
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Adjustment type"), {
      target: { value: "set" },
    })
    expect(
      screen.getByLabelText("Landed cost per unit"),
    ).toBeInTheDocument()
  })
})
