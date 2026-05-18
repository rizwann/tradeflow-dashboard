import { render, screen } from "@testing-library/react"

import { CustomerTable } from "@/features/customers/customer-table"

describe("CustomerTable", () => {
  const customer = {
    id: "cust-1",
    name: "Rahim Traders",
    phone: "+8801712345678",
    city: "Dhaka",
    address: "Banani",
    notes: "Repeat buyer",
    createdAt: "2026-05-10T08:00:00.000Z",
    createdBy: "user-1",
    ordersCount: 3,
    totalRevenue: 12500,
    totalProfit: 4200,
    lastOrderDate: "2026-05-18T08:00:00.000Z",
  }

  it("shows edit action for admin", () => {
    render(
      <CustomerTable
        customers={[customer]}
        currentUserId="admin-1"
        currentUserRole="admin"
      />,
    )

    expect(screen.getAllByLabelText(/edit customer rahim traders/i).length).toBeGreaterThan(0)
  })

  it("hides edit action for partner who did not create the customer", () => {
    render(
      <CustomerTable
        customers={[customer]}
        currentUserId="user-2"
        currentUserRole="partner"
      />,
    )

    expect(screen.getAllByLabelText(/view customer rahim traders/i).length).toBeGreaterThan(0)
    expect(screen.queryByLabelText(/edit customer rahim traders/i)).not.toBeInTheDocument()
  })

  it("shows returning customer badge when orders exceed one", () => {
    render(
      <CustomerTable
        customers={[customer]}
        currentUserId="user-1"
        currentUserRole="partner"
      />,
    )

    expect(screen.getAllByText(/returning customer/i).length).toBeGreaterThan(0)
  })
})
