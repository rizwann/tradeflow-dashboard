jest.mock("@/features/shipments/shipment-table-actions", () => ({
  ShipmentTableActions: ({
    shipmentCode,
    status,
    currentUserRole,
  }: {
    shipmentCode: string
    status: "draft" | "sent" | "in_transit" | "received" | "lost_damaged"
    currentUserRole: "admin" | "partner"
  }) => (
    <div>
      {status === "draft" ? <button>Mark as sent</button> : null}
      {status === "draft" && currentUserRole === "admin" ? (
        <>
          <button aria-label={`Edit draft shipment ${shipmentCode}`} />
          <button aria-label={`Delete draft shipment ${shipmentCode}`} />
        </>
      ) : null}
    </div>
  ),
}))

import { render, screen } from "@testing-library/react"

import { ShipmentTable } from "@/features/shipments/shipment-table"

describe("ShipmentTable", () => {
  it("shows draft management actions for admin", () => {
    render(
      <ShipmentTable
        shipments={[
          {
            id: "1",
            shipmentCode: "SHP-1",
            method: "cargo",
            status: "draft",
            shippingCost: 200,
            customsCost: 100,
            createdDate: "2026-05-06",
          },
        ]}
        currentUserRole="admin"
      />,
    )

    expect(screen.getByLabelText(/edit draft shipment shp-1/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/delete draft shipment shp-1/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /mark as sent/i })).toBeInTheDocument()
  })

  it("does not show draft edit/delete for partner", () => {
    render(
      <ShipmentTable
        shipments={[
          {
            id: "1",
            shipmentCode: "SHP-1",
            method: "cargo",
            status: "draft",
            shippingCost: 200,
            customsCost: 100,
            createdDate: "2026-05-06",
          },
        ]}
        currentUserRole="partner"
      />,
    )

    expect(screen.queryByLabelText(/edit draft shipment shp-1/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/delete draft shipment shp-1/i)).not.toBeInTheDocument()
  })
})
