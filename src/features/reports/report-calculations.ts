export type ProductProfitInput = {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
  fifoCost: number
}

export function calculateProductProfit(rows: ProductProfitInput[]) {
  return rows.map((row) => {
    const grossProfit = row.revenue - row.fifoCost
    const margin = row.revenue === 0 ? 0 : (grossProfit / row.revenue) * 100

    return {
      ...row,
      landedCostTotal: row.fifoCost,
      grossProfit,
      margin,
    }
  })
}
