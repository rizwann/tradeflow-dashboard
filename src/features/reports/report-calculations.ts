export type ProductProfitInput = {
  productId: string
  productName: string
  purchasePriceBDT: number
  quantitySold: number
  revenue: number
}

export function calculateProductProfit(rows: ProductProfitInput[]) {
  return rows.map((row) => {
    const productCost = row.purchasePriceBDT * row.quantitySold
    const grossProfit = row.revenue - productCost
    const margin = row.revenue === 0 ? 0 : (grossProfit / row.revenue) * 100

    return {
      ...row,
      productCost,
      grossProfit,
      margin,
    }
  })
}
