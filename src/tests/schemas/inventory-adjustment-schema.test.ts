import { inventoryAdjustmentSchema } from "@/features/inventory/inventory-adjustment-schema"

describe("inventoryAdjustmentSchema", () => {
  it("accepts valid adjustment data", () => {
    expect(
      inventoryAdjustmentSchema.safeParse({
        product_id: "p-1",
        location: "bangladesh",
        adjustment_type: "set",
        quantity: 0,
        reason: "Cycle count",
      }).success,
    ).toBe(true)
  })

  it("rejects negative quantities and missing reason", () => {
    expect(
      inventoryAdjustmentSchema.safeParse({
        product_id: "",
        location: "germany",
        adjustment_type: "increase",
        quantity: -1,
        reason: "no",
      }).success,
    ).toBe(false)
  })

  it("requires quantity greater than zero for increase or decrease", () => {
    expect(
      inventoryAdjustmentSchema.safeParse({
        product_id: "p-1",
        location: "germany",
        adjustment_type: "decrease",
        quantity: 0,
        reason: "Count correction",
      }).success,
    ).toBe(false)
  })
})
