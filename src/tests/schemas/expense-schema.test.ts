import { expenseSchema } from "@/features/expenses/expense-schema"

describe("expenseSchema", () => {
  it("accepts valid expense data and optional empty strings", () => {
    const parsed = expenseSchema.parse({
      type: "shipping",
      amount: 100,
      currency: "BDT",
      date: "2026-05-06",
      shipment_id: "",
      notes: "",
    })

    expect(parsed.shipment_id).toBeUndefined()
    expect(parsed.notes).toBeUndefined()
  })

  it("rejects invalid amount and missing date", () => {
    expect(
      expenseSchema.safeParse({
        type: "shipping",
        amount: 0,
        currency: "BDT",
        date: "",
      }).success,
    ).toBe(false)
  })
})
