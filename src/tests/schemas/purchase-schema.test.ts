import { purchaseSchema } from "@/features/purchases/purchase-schema"

describe("purchaseSchema", () => {
  it("accepts valid purchase data", () => {
    expect(
      purchaseSchema.safeParse({
        product_id: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 2,
        unit_cost_eur: 4.5,
        exchange_rate: 130,
        purchase_date: "2026-05-06",
        notes: "",
      }).success,
    ).toBe(true)
  })

  it("rejects invalid uuid and negative values", () => {
    expect(
      purchaseSchema.safeParse({
        product_id: "abc",
        quantity: 0,
        unit_cost_eur: -1,
        exchange_rate: 0,
        purchase_date: "2026-05-06",
      }).success,
    ).toBe(false)
  })
})
