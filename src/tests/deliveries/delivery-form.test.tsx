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

import { DeliveryForm } from "@/features/deliveries/delivery-form"

jest.mock("@/features/deliveries/delivery-actions", () => ({
  createOrUpdateDelivery: jest.fn(),
}))

describe("DeliveryForm", () => {
  it("renders core delivery fields", () => {
    render(<DeliveryForm saleId="sale-1" customerId="cust-1" />)

    expect(screen.getByLabelText("Status")).toBeInTheDocument()
    expect(screen.getByLabelText("Delivery method")).toBeInTheDocument()
    expect(screen.getByLabelText("Delivery cost")).toBeInTheDocument()
    expect(screen.getByLabelText("Paid by")).toBeInTheDocument()
  })

  it("renders edit defaults", () => {
    render(
      <DeliveryForm
        saleId="sale-1"
        customerId="cust-1"
        delivery={{
          id: "del-1",
          status: "shipped",
          delivery_method: "Pathao",
          tracking_number: "TRK-001",
          delivery_cost: 80,
          delivery_cost_paid_by: "business",
          shipped_at: "2026-05-14T10:30:00.000Z",
          delivered_at: null,
          notes: "Handle carefully",
        }}
      />,
    )

    expect(screen.getByDisplayValue("Pathao")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Update delivery" })).toBeInTheDocument()
  })
})
