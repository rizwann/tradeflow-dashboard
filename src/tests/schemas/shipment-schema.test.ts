import { shipmentFormSchema } from "@/features/shipments/shipment-schema"

describe("shipmentFormSchema", () => {
  it("accepts valid shipment data", () => {
    expect(
      shipmentFormSchema.safeParse({
        shipment_code: "SHP-1",
        carrier_name: "",
        method: "cargo",
        sent_date: "",
        expected_arrival_date: "",
        shipping_cost: 100,
        customs_cost: 50,
        notes: "",
        items: [
          {
            product_id: "550e8400-e29b-41d4-a716-446655440000",
            quantity: 2,
          },
        ],
      }).success,
    ).toBe(true)
  })

  it("rejects invalid item uuid and non-positive quantity", () => {
    expect(
      shipmentFormSchema.safeParse({
        shipment_code: "S",
        method: "cargo",
        shipping_cost: 0,
        customs_cost: 0,
        items: [{ product_id: "bad", quantity: 0 }],
      }).success,
    ).toBe(false)
  })
})
