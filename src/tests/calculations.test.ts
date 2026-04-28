import {
  calculateGrossProfit,
  calculateLandedCost,
  calculateNetProfit,
  calculateProfitMargin,
  calculatePurchasePriceBDT,
  calculateROI,
} from "@/lib/calculations"

describe("business calculations", () => {
  it("calculates purchase price in BDT", () => {
    expect(calculatePurchasePriceBDT(1.5, 140)).toBe(210)
  })

  it("calculates landed cost", () => {
    expect(
      calculateLandedCost({
        purchaseCost: 200,
        allocatedShippingCost: 40,
        allocatedCustomsCost: 20,
        otherCosts: 10,
      }),
    ).toBe(270)
  })

  it("calculates gross profit", () => {
    expect(calculateGrossProfit(500, 300)).toBe(200)
  })

  it("calculates net profit", () => {
    expect(
      calculateNetProfit({
        revenue: 1000,
        productCosts: 400,
        expenses: 150,
      }),
    ).toBe(450)
  })

  it("calculates profit margin", () => {
    expect(calculateProfitMargin(250, 1000)).toBe(25)
  })

  it("returns 0 profit margin when revenue is 0", () => {
    expect(calculateProfitMargin(100, 0)).toBe(0)
  })

  it("calculates ROI", () => {
    expect(calculateROI(200, 1000)).toBe(20)
  })

  it("returns 0 ROI when investment is 0", () => {
    expect(calculateROI(200, 0)).toBe(0)
  })
})
