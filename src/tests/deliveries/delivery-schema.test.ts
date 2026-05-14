import { deliverySchema } from "@/features/deliveries/delivery-schema"

describe("deliverySchema", () => {
  it("accepts a practical shipped delivery payload", () => {
    expect(
      deliverySchema.safeParse({
        sale_id: "550e8400-e29b-41d4-a716-446655440000",
        customer_id: "550e8400-e29b-41d4-a716-446655440001",
        status: "shipped",
        delivery_method: "Pathao",
        tracking_number: "TRK-001",
        delivery_cost: 80,
        delivery_cost_paid_by: "business",
        shipped_at: "2026-05-14T10:30",
        delivered_at: "",
        notes: "",
      }).success,
    ).toBe(true)
  })

  it("rejects delivered_at when status is not delivered", () => {
    expect(
      deliverySchema.safeParse({
        sale_id: "550e8400-e29b-41d4-a716-446655440000",
        status: "pending",
        delivery_cost: 0,
        delivery_cost_paid_by: "customer",
        delivered_at: "2026-05-14T10:30",
      }).success,
    ).toBe(false)
  })
})
