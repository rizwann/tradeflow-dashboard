export type ProductProfitInput = {
  productId: string
  productName: string
  landedCostPerUnit: number
  quantitySold: number
  revenue: number
}

export function calculateProductProfit(rows: ProductProfitInput[]) {
  return rows.map((row) => {
    const landedCostTotal = row.landedCostPerUnit * row.quantitySold
    const grossProfit = row.revenue - landedCostTotal
    const margin = row.revenue === 0 ? 0 : (grossProfit / row.revenue) * 100

    return {
      ...row,
      landedCostTotal,
      grossProfit,
      margin,
    }
  })
}
