import { saleSchema } from "@/features/sales/sale-schema"

describe("saleSchema", () => {
  it("accepts valid multi-item sale data for an existing customer", () => {
    expect(
      saleSchema.safeParse({
        sale_date: "2026-05-06",
        customer_id: "550e8400-e29b-41d4-a716-446655440001",
        payment_status: "paid",
        notes: "",
        items: [
          {
            product_id: "550e8400-e29b-41d4-a716-446655440000",
            quantity: 1,
            unit_selling_price_bdt: 1200,
            discount: 0,
          },
          {
            product_id: "550e8400-e29b-41d4-a716-446655440002",
            quantity: 2,
            unit_selling_price_bdt: 800,
            discount: 50,
          },
        ],
      }).success,
    ).toBe(true)
  })

  it("accepts valid sale data for a new customer", () => {
    expect(
      saleSchema.safeParse({
        sale_date: "2026-05-06",
        customer_name: "Rahim Traders",
        customer_phone: "+8801712345678",
        customer_city: "Dhaka",
        customer_address: "",
        payment_status: "paid",
        notes: "",
        items: [
          {
            product_id: "550e8400-e29b-41d4-a716-446655440000",
            quantity: 1,
            unit_selling_price_bdt: 1200,
            discount: 0,
          },
        ],
      }).success,
    ).toBe(true)
  })

  it("rejects invalid items and missing customer selection", () => {
    expect(
      saleSchema.safeParse({
        sale_date: "",
        customer_name: "",
        customer_phone: "",
        payment_status: "unknown",
        items: [
          {
            product_id: "",
            quantity: 0,
            unit_selling_price_bdt: -1,
            discount: -1,
          },
        ],
      }).success,
    ).toBe(false)
  })

  it("rejects negative line revenue", () => {
    const result = saleSchema.safeParse({
      sale_date: "2026-05-06",
      customer_id: "550e8400-e29b-41d4-a716-446655440001",
      payment_status: "paid",
      items: [
        {
          product_id: "550e8400-e29b-41d4-a716-446655440000",
          quantity: 1,
          unit_selling_price_bdt: 100,
          discount: 150,
        },
      ],
    })

    expect(result.success).toBe(false)
  })
})
