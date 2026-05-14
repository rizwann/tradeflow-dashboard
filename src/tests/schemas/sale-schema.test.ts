import { saleSchema } from "@/features/sales/sale-schema"

describe("saleSchema", () => {
  it("accepts valid sale data for an existing customer", () => {
    expect(
      saleSchema.safeParse({
        product_id: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 1,
        unit_selling_price_bdt: 1200,
        discount: 0,
        sale_date: "2026-05-06",
        customer_id: "550e8400-e29b-41d4-a716-446655440001",
        payment_status: "paid",
        notes: "",
      }).success,
    ).toBe(true)
  })

  it("accepts valid sale data for a new customer", () => {
    expect(
      saleSchema.safeParse({
        product_id: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 1,
        unit_selling_price_bdt: 1200,
        discount: 0,
        sale_date: "2026-05-06",
        customer_name: "Rahim Traders",
        customer_phone: "+8801712345678",
        customer_city: "Dhaka",
        customer_address: "",
        payment_status: "paid",
        notes: "",
      }).success,
    ).toBe(true)
  })

  it("rejects invalid values and missing customer selection", () => {
    expect(
      saleSchema.safeParse({
        product_id: "bad",
        quantity: 0,
        unit_selling_price_bdt: -1,
        discount: -1,
        sale_date: "",
        customer_name: "",
        customer_phone: "",
        payment_status: "unknown",
      }).success,
    ).toBe(false)
  })
})
