import {
  calculateLandedCostPerUnit,
  calculateMargin,
  calculateRealGrossProfit,
} from "@/features/reports/landed-cost"

describe("landed cost helpers", () => {
  it("calculates landed cost per unit", () => {
    expect(
      calculateLandedCostPerUnit({
        purchasePriceBDT: 120,
        allocatedShipmentCostPerUnit: 30,
      }),
    ).toBe(150)
  })

  it("calculates real gross profit and margin", () => {
    expect(
      calculateRealGrossProfit({
        revenue: 500,
        landedCostTotal: 320,
      }),
    ).toBe(180)
    expect(calculateMargin({ profit: 180, revenue: 500 })).toBe(36)
    expect(calculateMargin({ profit: 50, revenue: 0 })).toBe(0)
  })
})
