export type CustomerAnalyticsCustomer = {
  id: string
  name: string
  createdAt: string | null
}

export type CustomerAnalyticsSale = {
  id: string
  customerId: string | null
  customerName: string | null
  productId: string
  productName: string | null
  quantity: number
  unitSellingPriceBdt: number
  discount: number | null
  saleDate: string
}

export type CustomerSaleProfit = {
  saleId: string
  grossProfit: number
}

export type DeliveryAnalyticsRow = {
  status: "pending" | "shipped" | "delivered" | "cancelled"
  deliveryCost: number
  deliveryCostPaidBy: "business" | "customer"
}

export type ProductAnalyticsProduct = {
  id: string
  name: string
  sku: string
}

export type CustomerLeaderboardRow = {
  customerId: string
  customerName: string
  ordersCount: number
  revenue: number
  profit: number
  lastOrderDate: string | null
}

export type CustomerInsights = {
  totalCustomers: number
  newCustomersThisMonth: number
  returningCustomers: number
  averageOrderValue: number
  retentionRate: number
  hasProfitData: boolean
  bestCustomerByRevenue: CustomerLeaderboardRow | null
  bestCustomerByProfit: CustomerLeaderboardRow | null
  topCustomers: CustomerLeaderboardRow[]
}

export type DeliveryInsights = {
  totalDeliveries: number
  pendingDeliveries: number
  shippedDeliveries: number
  deliveredDeliveries: number
  cancelledDeliveries: number
  nonCancelledDeliveries: number
  completionRate: number
  businessPaidDeliveryCost: number
  averageDeliveryCost: number
  customerPaidDeliveryPercentage: number
}

export type LeastSellingProductRow = {
  productId: string
  productName: string
  sku: string
  quantitySold: number
  revenue: number
}

export type CustomerDetailInsights = {
  totalOrders: number
  activeOrders: number
  totalRevenue: number
  averageOrderValue: number
  lastOrderDate: string | null
  deliveredOrders: number
  pendingDeliveries: number
  totalDeliverySpend: number
  favoriteProduct:
    | {
        productName: string
        quantitySold: number
        ordersCount: number
      }
    | null
}

function getTimestamp(value: string | null) {
  if (!value) return Number.NEGATIVE_INFINITY

  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed
}

function isSameUtcMonth(value: string | null, referenceDate: Date) {
  if (!value) return false

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  return (
    parsed.getUTCFullYear() === referenceDate.getUTCFullYear() &&
    parsed.getUTCMonth() === referenceDate.getUTCMonth()
  )
}

export function calculateSaleRevenue(params: {
  quantity: number
  unitSellingPriceBdt: number
  discount: number | null
}) {
  return (
    Number(params.quantity) * Number(params.unitSellingPriceBdt) -
    Number(params.discount ?? 0)
  )
}

export function calculateCustomerInsights(params: {
  customers?: CustomerAnalyticsCustomer[]
  sales: CustomerAnalyticsSale[]
  saleProfits?: CustomerSaleProfit[]
  referenceDate?: Date
}) {
  const customers = params.customers ?? []
  const sales = params.sales
  const saleProfits = params.saleProfits ?? []
  const referenceDate = params.referenceDate ?? new Date()

  const customerLookup = new Map(customers.map((customer) => [customer.id, customer]))
  const saleProfitById = new Map<string, number>()

  for (const entry of saleProfits) {
    saleProfitById.set(
      entry.saleId,
      (saleProfitById.get(entry.saleId) ?? 0) + Number(entry.grossProfit),
    )
  }

  const leaderboardMap = new Map<string, CustomerLeaderboardRow>()
  let totalRevenue = 0

  for (const sale of sales) {
    const revenue = calculateSaleRevenue({
      quantity: sale.quantity,
      unitSellingPriceBdt: sale.unitSellingPriceBdt,
      discount: sale.discount,
    })

    totalRevenue += revenue

    if (!sale.customerId) {
      continue
    }

    const existing = leaderboardMap.get(sale.customerId) ?? {
      customerId: sale.customerId,
      customerName:
        sale.customerName ?? customerLookup.get(sale.customerId)?.name ?? "Unknown customer",
      ordersCount: 0,
      revenue: 0,
      profit: 0,
      lastOrderDate: null,
    }

    existing.ordersCount += 1
    existing.revenue += revenue
    existing.profit += saleProfitById.get(sale.id) ?? 0

    if (getTimestamp(sale.saleDate) > getTimestamp(existing.lastOrderDate)) {
      existing.lastOrderDate = sale.saleDate
    }

    leaderboardMap.set(sale.customerId, existing)
  }

  const topCustomers = Array.from(leaderboardMap.values()).sort((left, right) => {
    return (
      right.revenue - left.revenue ||
      right.ordersCount - left.ordersCount ||
      left.customerName.localeCompare(right.customerName)
    )
  })

  const returningCustomers = topCustomers.filter(
    (customer) => customer.ordersCount > 1,
  ).length

  const bestCustomerByProfit =
    saleProfitById.size > 0
      ? [...topCustomers].sort((left, right) => {
          return (
            right.profit - left.profit ||
            right.revenue - left.revenue ||
            left.customerName.localeCompare(right.customerName)
          )
        })[0] ?? null
      : null

  return {
    totalCustomers: customers.length,
    newCustomersThisMonth: customers.filter((customer) =>
      isSameUtcMonth(customer.createdAt, referenceDate),
    ).length,
    returningCustomers,
    averageOrderValue: sales.length === 0 ? 0 : totalRevenue / sales.length,
    retentionRate:
      customers.length === 0 ? 0 : (returningCustomers / customers.length) * 100,
    hasProfitData: saleProfitById.size > 0,
    bestCustomerByRevenue: topCustomers[0] ?? null,
    bestCustomerByProfit,
    topCustomers,
  } satisfies CustomerInsights
}

export function calculateDeliveryInsights(deliveries: DeliveryAnalyticsRow[]) {
  const totalDeliveries = deliveries.length
  const pendingDeliveries = deliveries.filter(
    (delivery) => delivery.status === "pending",
  ).length
  const shippedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "shipped",
  ).length
  const deliveredDeliveries = deliveries.filter(
    (delivery) => delivery.status === "delivered",
  ).length
  const cancelledDeliveries = deliveries.filter(
    (delivery) => delivery.status === "cancelled",
  ).length
  const nonCancelledDeliveries = totalDeliveries - cancelledDeliveries

  const businessPaidDeliveryCost = deliveries.reduce((sum, delivery) => {
    if (
      delivery.status === "cancelled" ||
      delivery.deliveryCostPaidBy !== "business"
    ) {
      return sum
    }

    return sum + Number(delivery.deliveryCost)
  }, 0)

  const totalNonCancelledCost = deliveries.reduce((sum, delivery) => {
    if (delivery.status === "cancelled") {
      return sum
    }

    return sum + Number(delivery.deliveryCost)
  }, 0)

  const customerPaidDeliveries = deliveries.filter(
    (delivery) => delivery.deliveryCostPaidBy === "customer",
  ).length

  return {
    totalDeliveries,
    pendingDeliveries,
    shippedDeliveries,
    deliveredDeliveries,
    cancelledDeliveries,
    nonCancelledDeliveries,
    completionRate:
      nonCancelledDeliveries === 0
        ? 0
        : (deliveredDeliveries / nonCancelledDeliveries) * 100,
    businessPaidDeliveryCost,
    averageDeliveryCost:
      nonCancelledDeliveries === 0 ? 0 : totalNonCancelledCost / nonCancelledDeliveries,
    customerPaidDeliveryPercentage:
      totalDeliveries === 0 ? 0 : (customerPaidDeliveries / totalDeliveries) * 100,
  } satisfies DeliveryInsights
}

export function calculateLeastSellingProducts(params: {
  products: ProductAnalyticsProduct[]
  sales: CustomerAnalyticsSale[]
  limit?: number
}) {
  const salesByProduct = new Map<string, LeastSellingProductRow>()
  const productLookup = new Map(params.products.map((product) => [product.id, product]))

  for (const sale of params.sales) {
    const product = productLookup.get(sale.productId)

    const existing = salesByProduct.get(sale.productId) ?? {
      productId: sale.productId,
      productName: sale.productName ?? product?.name ?? "Unknown product",
      sku: product?.sku ?? "N/A",
      quantitySold: 0,
      revenue: 0,
    }

    existing.quantitySold += Number(sale.quantity)
    existing.revenue += calculateSaleRevenue({
      quantity: sale.quantity,
      unitSellingPriceBdt: sale.unitSellingPriceBdt,
      discount: sale.discount,
    })

    salesByProduct.set(sale.productId, existing)
  }

  return Array.from(salesByProduct.values())
    .filter((row) => row.quantitySold > 0)
    .sort((left, right) => {
      return (
        left.quantitySold - right.quantitySold ||
        left.revenue - right.revenue ||
        left.productName.localeCompare(right.productName)
      )
    })
    .slice(0, params.limit ?? 5)
}

export function calculateCustomerDetailInsights(params: {
  sales: CustomerAnalyticsSale[]
  deliveries: DeliveryAnalyticsRow[]
}) {
  const totalOrders = params.sales.length
  const activeSales = params.sales
  const totalRevenue = activeSales.reduce((sum, sale) => {
    return (
      sum +
      calculateSaleRevenue({
        quantity: sale.quantity,
        unitSellingPriceBdt: sale.unitSellingPriceBdt,
        discount: sale.discount,
      })
    )
  }, 0)

  const favoriteProductMap = new Map<
    string,
    { productName: string; quantitySold: number; ordersCount: number }
  >()

  for (const sale of activeSales) {
    const existing = favoriteProductMap.get(sale.productId) ?? {
      productName: sale.productName ?? "Unknown product",
      quantitySold: 0,
      ordersCount: 0,
    }

    existing.quantitySold += Number(sale.quantity)
    existing.ordersCount += 1

    favoriteProductMap.set(sale.productId, existing)
  }

  const favoriteProduct =
    Array.from(favoriteProductMap.values()).sort((left, right) => {
      return (
        right.quantitySold - left.quantitySold ||
        right.ordersCount - left.ordersCount ||
        left.productName.localeCompare(right.productName)
      )
    })[0] ?? null

  const lastOrderDate = params.sales.reduce<string | null>((latest, sale) => {
    if (getTimestamp(sale.saleDate) > getTimestamp(latest)) {
      return sale.saleDate
    }

    return latest
  }, null)

  return {
    totalOrders,
    activeOrders: activeSales.length,
    totalRevenue,
    averageOrderValue:
      activeSales.length === 0 ? 0 : totalRevenue / activeSales.length,
    lastOrderDate,
    deliveredOrders: params.deliveries.filter(
      (delivery) => delivery.status === "delivered",
    ).length,
    pendingDeliveries: params.deliveries.filter(
      (delivery) => delivery.status === "pending",
    ).length,
    totalDeliverySpend: params.deliveries.reduce((sum, delivery) => {
      if (delivery.status === "cancelled") {
        return sum
      }

      return sum + Number(delivery.deliveryCost)
    }, 0),
    favoriteProduct,
  } satisfies CustomerDetailInsights
}
