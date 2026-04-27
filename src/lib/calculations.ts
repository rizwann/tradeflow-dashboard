export function calculatePurchasePriceBDT(
  priceEur: number,
  exchangeRate: number,
) {
  return priceEur * exchangeRate
}

export function calculateLandedCost(params: {
  purchaseCost: number
  allocatedShippingCost: number
  allocatedCustomsCost: number
  otherCosts?: number
}) {
  return (
    params.purchaseCost +
    params.allocatedShippingCost +
    params.allocatedCustomsCost +
    (params.otherCosts ?? 0)
  )
}

export function calculateGrossProfit(sellingPrice: number, landedCost: number) {
  return sellingPrice - landedCost
}

export function calculateNetProfit(params: {
  revenue: number
  productCosts: number
  expenses: number
}) {
  return params.revenue - params.productCosts - params.expenses
}

export function calculateProfitMargin(profit: number, revenue: number) {
  if (revenue === 0) return 0

  return (profit / revenue) * 100
}

export function calculateROI(profit: number, totalInvestment: number) {
  if (totalInvestment === 0) return 0

  return (profit / totalInvestment) * 100
}
