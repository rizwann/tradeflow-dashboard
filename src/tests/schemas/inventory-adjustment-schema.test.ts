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
        landed_cost_per_unit: 120,
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

  it("requires landed cost for bangladesh increase and set adjustments", () => {
    expect(
      inventoryAdjustmentSchema.safeParse({
        product_id: "p-1",
        location: "bangladesh",
        adjustment_type: "increase",
        quantity: 2,
        reason: "Manual restock",
      }).success,
    ).toBe(false)

    expect(
      inventoryAdjustmentSchema.safeParse({
        product_id: "p-1",
        location: "bangladesh",
        adjustment_type: "set",
        quantity: 4,
        reason: "Cycle count correction",
      }).success,
    ).toBe(false)
  })

  it("does not require landed cost for bangladesh decrease", () => {
    expect(
      inventoryAdjustmentSchema.safeParse({
        product_id: "p-1",
        location: "bangladesh",
        adjustment_type: "decrease",
        quantity: 1,
        reason: "Damaged stock",
      }).success,
    ).toBe(true)
  })
})
