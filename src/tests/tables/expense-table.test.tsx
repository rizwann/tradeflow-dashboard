jest.mock("@/features/expenses/expense-table-actions", () => ({
  ExpenseTableActions: ({
    expenseType,
    canEdit,
    canDelete,
  }: {
    expenseType: string
    canEdit: boolean
    canDelete: boolean
  }) => (
    <div>
      {canEdit ? <button aria-label={`Edit ${expenseType} expense`} /> : null}
      {canDelete ? (
        <button aria-label={`Delete ${expenseType} expense`} />
      ) : null}
    </div>
  ),
}))

import { render, screen } from "@testing-library/react"

import { ExpenseTable } from "@/features/expenses/expense-table"

describe("ExpenseTable", () => {
  const expense = {
    id: "1",
    type: "shipping" as const,
    amount: 500,
    currency: "BDT",
    relatedShipment: "SHP-1",
    date: "2026-05-06",
    notes: "Port fee",
    paidById: "user-1",
  }

  it("shows edit and delete for admin", () => {
    render(
      <ExpenseTable
        expenses={[expense]}
        currentUserId="admin-1"
        currentUserRole="admin"
      />,
    )

    expect(screen.getByLabelText(/edit shipping expense/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/delete shipping expense/i)).toBeInTheDocument()
  })

  it("hides delete for partner and keeps own edit", () => {
    render(
      <ExpenseTable
        expenses={[expense]}
        currentUserId="user-1"
        currentUserRole="partner"
      />,
    )

    expect(screen.getByLabelText(/edit shipping expense/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/delete shipping expense/i)).not.toBeInTheDocument()
  })
})
