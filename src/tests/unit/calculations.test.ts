import {
  calculateGrossProfit,
  calculateLandedCost,
  calculateNetProfit,
  calculateProfitMargin,
  calculatePurchasePriceBDT,
  calculateROI,
} from "@/lib/calculations"

describe("calculations", () => {
  it("calculates purchase price in BDT", () => {
    expect(calculatePurchasePriceBDT(10, 130)).toBe(1300)
  })

  it("calculates landed cost including optional costs", () => {
    expect(
      calculateLandedCost({
        purchaseCost: 100,
        allocatedShippingCost: 20,
        allocatedCustomsCost: 10,
        otherCosts: 5,
      }),
    ).toBe(135)
  })

  it("calculates gross profit, net profit, margin, and roi", () => {
    expect(calculateGrossProfit(500, 320)).toBe(180)
    expect(
      calculateNetProfit({
        revenue: 1000,
        productCosts: 600,
        expenses: 150,
      }),
    ).toBe(250)
    expect(calculateProfitMargin(200, 1000)).toBe(20)
    expect(calculateROI(250, 500)).toBe(50)
  })

  it("returns zero margin and roi when divisor is zero", () => {
    expect(calculateProfitMargin(100, 0)).toBe(0)
    expect(calculateROI(100, 0)).toBe(0)
  })
})
