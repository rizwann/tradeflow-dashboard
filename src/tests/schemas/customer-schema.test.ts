import { customerSchema } from "@/features/customers/customer-schema"

describe("customerSchema", () => {
  it("accepts valid customer data and normalizes empty optional fields", () => {
    const result = customerSchema.safeParse({
      name: "Rahim Traders",
      phone: "+8801712345678",
      address: "",
      city: "",
      notes: "",
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.address).toBeUndefined()
      expect(result.data.city).toBeUndefined()
      expect(result.data.notes).toBeUndefined()
    }
  })

  it("rejects invalid required values", () => {
    expect(
      customerSchema.safeParse({
        name: "A",
        phone: "12",
        address: "",
        city: "",
        notes: "",
      }).success,
    ).toBe(false)
  })
})
