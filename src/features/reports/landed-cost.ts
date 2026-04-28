export function calculateLandedCostPerUnit(params: {
  purchasePriceBDT: number
  allocatedShipmentCostPerUnit: number
}) {
  return params.purchasePriceBDT + params.allocatedShipmentCostPerUnit
}

export function calculateRealGrossProfit(params: {
  revenue: number
  landedCostTotal: number
}) {
  return params.revenue - params.landedCostTotal
}

export function calculateMargin(params: { profit: number; revenue: number }) {
  if (params.revenue === 0) return 0

  return (params.profit / params.revenue) * 100
}
