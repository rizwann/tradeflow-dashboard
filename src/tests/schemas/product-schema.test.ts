import { productSchema } from "@/features/products/product-schema"

describe("productSchema", () => {
  it("accepts valid product data", () => {
    expect(
      productSchema.safeParse({
        name: "Soap",
        brand: "Brand",
        category: "Care",
        sku: "SKU-1",
        purchase_price_eur: 10,
        exchange_rate: 130,
        suggested_selling_price_bdt: 1700,
        image_url: "",
        notes: "",
      }).success,
    ).toBe(true)
  })

  it("rejects required and invalid fields", () => {
    const result = productSchema.safeParse({
      name: "",
      brand: "",
      category: "",
      sku: "",
      purchase_price_eur: -1,
      exchange_rate: 0,
      suggested_selling_price_bdt: -1,
      image_url: "not-a-url",
      notes: "",
    })

    expect(result.success).toBe(false)
  })
})
