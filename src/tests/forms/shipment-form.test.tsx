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

import { ShipmentForm } from "@/features/shipments/shipment-form"

jest.mock("@/features/shipments/shipment-actions", () => ({
  createShipment: jest.fn(),
  updateShipment: jest.fn(),
}))

const products = [
  { id: "550e8400-e29b-41d4-a716-446655440000", name: "Soap" },
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Shampoo" },
]

describe("ShipmentForm", () => {
  it("renders edit defaults", () => {
    render(
      <ShipmentForm
        mode="edit"
        products={products}
        shipment={{
          id: "shp-1",
          shipment_code: "SHP-1",
          carrier_name: "DHL",
          method: "cargo",
          sent_date: "",
          expected_arrival_date: "2026-05-10",
          shipping_cost: 100,
          customs_cost: 50,
          notes: "Handle carefully",
          items: [{ product_id: products[0].id, quantity: 2 }],
        }}
      />,
    )

    expect(screen.getByDisplayValue("SHP-1")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Update shipment" })).toBeInTheDocument()
  })

  it("can add and remove item rows", () => {
    render(<ShipmentForm mode="create" products={products} />)

    expect(screen.getAllByText(/Remove item/i)).toHaveLength(1)
    fireEvent.click(screen.getByRole("button", { name: "Add item" }))
    expect(screen.getAllByText(/Remove item/i)).toHaveLength(2)

    fireEvent.click(screen.getAllByRole("button", { name: "Remove item" })[1])
    expect(screen.getAllByText(/Remove item/i)).toHaveLength(1)
  })
})
