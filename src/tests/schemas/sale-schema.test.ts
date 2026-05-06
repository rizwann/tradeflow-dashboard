import { saleSchema } from "@/features/sales/sale-schema"

describe("saleSchema", () => {
  it("accepts valid sale data", () => {
    expect(
      saleSchema.safeParse({
        product_id: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 1,
        unit_selling_price_bdt: 1200,
        discount: 0,
        sale_date: "2026-05-06",
        customer_name: "",
        payment_status: "paid",
        notes: "",
      }).success,
    ).toBe(true)
  })

  it("rejects invalid values", () => {
    expect(
      saleSchema.safeParse({
        product_id: "bad",
        quantity: 0,
        unit_selling_price_bdt: -1,
        discount: -1,
        sale_date: "",
        payment_status: "unknown",
      }).success,
    ).toBe(false)
  })
})
