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

import { ExpenseForm } from "@/features/expenses/expense-form"

jest.mock("@/features/expenses/expense-actions", () => ({
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
}))

describe("ExpenseForm", () => {
  it("renders shipment select support", () => {
    render(
      <ExpenseForm
        mode="create"
        shipments={[{ id: "1", shipment_code: "SHP-1" }]}
      />,
    )

    expect(screen.getByRole("option", { name: "SHP-1" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add expense" })).toBeInTheDocument()
  })

  it("renders edit defaults", () => {
    render(
      <ExpenseForm
        mode="edit"
        shipments={[]}
        expense={{
          id: "exp-1",
          type: "marketing",
          amount: 200,
          currency: "BDT",
          date: "2026-05-06",
          shipment_id: null,
          notes: "Promo",
        }}
      />,
    )

    expect(screen.getByDisplayValue("200")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Update expense" })).toBeInTheDocument()
  })
})
