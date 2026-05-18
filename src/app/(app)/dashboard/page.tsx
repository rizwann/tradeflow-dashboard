import type { ReactNode } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  calculateCustomerInsights,
  calculateDeliveryInsights,
  calculateLeastSellingProducts,
  calculateSaleRevenue,
} from "@/features/analytics/customer-delivery-analytics"
import { RevenueExpenseChart } from "@/features/dashboard/revenue-expense-chart"
import { calculateNetProfit, calculateProfitMargin } from "@/lib/calculations"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Dashboard",
}

type SaleRow = {
  id: string
  product_id: string
  customer_id: string | null
  quantity: number
  unit_selling_price_bdt: number
  discount: number | null
  sale_date: string
  status: "active" | "voided"
  customers: {
    name: string
  } | null
  products: {
    name: string
  } | null
}

type CustomerRow = {
  id: string
  name: string
  created_at: string | null
}

type DeliveryInsightRow = {
  status: "pending" | "shipped" | "delivered" | "cancelled"
  delivery_cost: number
  delivery_cost_paid_by: "business" | "customer"
}

type ExpenseRow = {
  amount: number
  currency: string
  date: string
}

type InventoryRow = {
  product_id: string
  location: "germany" | "in_transit" | "bangladesh"
  quantity: number
}

type ProductRow = {
  id: string
  name: string
  sku: string
  purchase_price_bdt: number
}

type SaleBatchConsumptionRow = {
  sale_id: string
  product_id: string
  quantity: number
  total_cost: number
  gross_profit: number
  sales: {
    status: "active" | "voided"
  } | null
}

type InventoryBatchRow = {
  product_id: string
  remaining_quantity: number
  landed_cost_per_unit: number
}

type ProductInventorySummary = {
  productId: string
  productName: string
  sku: string
  germany: number
  inTransit: number
  bangladesh: number
  total: number
}

type MonthlyMetric = {
  sortKey: string
  month: string
  revenue: number
  expenses: number
  grossProfit: number
  netProfit: number
}

type ChartMetric = Omit<MonthlyMetric, "sortKey">

const deliveryStatusOrder = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
] as const

const deliveryStatusMeta: Record<
  DeliveryInsightRow["status"],
  {
    label: string
    barClassName: string
    badgeClassName: string
  }
> = {
  pending: {
    label: "Pending",
    barClassName: "bg-amber-500/80 dark:bg-amber-400/80",
    badgeClassName:
      "border-amber-200/80 bg-amber-500/10 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300",
  },
  shipped: {
    label: "Shipped",
    barClassName: "bg-sky-500/80 dark:bg-sky-400/80",
    badgeClassName:
      "border-sky-200/80 bg-sky-500/10 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300",
  },
  delivered: {
    label: "Delivered",
    barClassName: "bg-emerald-500/80 dark:bg-emerald-400/80",
    badgeClassName:
      "border-emerald-200/80 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    barClassName: "bg-red-500/80 dark:bg-red-400/80",
    badgeClassName:
      "border-red-200/80 bg-red-500/10 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300",
  },
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatQuantity(value: number) {
  return value.toLocaleString("en-US")
}

function formatDate(value: string | null) {
  if (!value) return "No orders yet"

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate)
}

function getMonthParts(date: string) {
  const parsedDate = new Date(date)

  return {
    sortKey: `${parsedDate.getUTCFullYear()}-${String(
      parsedDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`,
    label: parsedDate.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }),
  }
}

function getOrCreateMonthMetric(
  monthlyMap: Map<string, MonthlyMetric>,
  date: string,
) {
  const { sortKey, label } = getMonthParts(date)
  const existing = monthlyMap.get(sortKey)

  if (existing) {
    return existing
  }

  const nextValue: MonthlyMetric = {
    sortKey,
    month: label,
    revenue: 0,
    expenses: 0,
    grossProfit: 0,
    netProfit: 0,
  }

  monthlyMap.set(sortKey, nextValue)

  return nextValue
}

function getStockBadgeVariant(total: number) {
  if (total === 0) return "destructive"
  if (total <= 5) return "secondary"

  return "default"
}

function getStockBadgeLabel(total: number) {
  if (total === 0) return "Out of stock"
  if (total <= 5) return "Low stock"

  return "Healthy"
}

function DashboardTableCard(props: {
  title: string
  description: string
  columns: string[]
  rows: ReactNode
  emptyTitle: string
  emptyDescription: string
}) {
  const { title, description, columns, rows, emptyTitle, emptyDescription } =
    props

  return (
    <Card className="border-border/60 bg-card/78">
      <CardHeader className="pb-2">
        <p className="eyebrow-label">Operational Insight</p>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[30rem]">
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>{rows}</TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: sales, error: salesError },
    { data: customers, error: customersError },
    { data: expenses, error: expensesError },
    { data: deliveries, error: deliveriesError },
    { data: inventory, error: inventoryError },
    { data: products, error: productsError },
    { data: saleBatchConsumptions, error: saleBatchError },
    { data: inventoryBatches, error: inventoryBatchesError },
  ] = await Promise.all([
    supabase
      .from("sales")
      .select(
        "id, product_id, customer_id, quantity, unit_selling_price_bdt, discount, sale_date, status, customers(name), products(name)",
      )
      .eq("status", "active")
      .returns<SaleRow[]>(),
    supabase.from("customers").select("id, name, created_at").returns<
      CustomerRow[]
    >(),
    supabase.from("expenses").select("amount, currency, date").returns<
      ExpenseRow[]
    >(),
    supabase
      .from("sales_deliveries")
      .select("status, delivery_cost, delivery_cost_paid_by")
      .returns<DeliveryInsightRow[]>(),
    supabase
      .from("inventory")
      .select("product_id, location, quantity")
      .returns<InventoryRow[]>(),
    supabase
      .from("products")
      .select("id, name, sku, purchase_price_bdt")
      .returns<ProductRow[]>(),
    supabase
      .from("sale_batch_consumptions")
      .select(
        "sale_id, product_id, quantity, total_cost, gross_profit, sales!inner(status)",
      )
      .eq("sales.status", "active")
      .returns<SaleBatchConsumptionRow[]>(),
    supabase
      .from("inventory_batches")
      .select("product_id, remaining_quantity, landed_cost_per_unit")
      .gt("remaining_quantity", 0)
      .returns<InventoryBatchRow[]>(),
  ])

  if (
    salesError ||
    customersError ||
    expensesError ||
    deliveriesError ||
    inventoryError ||
    productsError ||
    saleBatchError ||
    inventoryBatchesError
  ) {
    return (
      <ErrorState
        title="Could not load dashboard"
        message={
          salesError?.message ??
          customersError?.message ??
          expensesError?.message ??
          deliveriesError?.message ??
          inventoryError?.message ??
          productsError?.message ??
          saleBatchError?.message ??
          inventoryBatchesError?.message
        }
      />
    )
  }

  const salesRows = sales ?? []
  const customerRows = customers ?? []
  const expenseRows = expenses ?? []
  const deliveryRows = deliveries ?? []
  const inventoryRows = inventory ?? []
  const productRows = products ?? []
  const consumptionRows = saleBatchConsumptions ?? []
  const inventoryBatchRows = inventoryBatches ?? []

  const productById = new Map(
    productRows.map((product) => [product.id, product] as const),
  )

  const saleDateById = new Map(
    salesRows.map((sale) => [sale.id, sale.sale_date] as const),
  )

  const inventoryByProduct = new Map<string, ProductInventorySummary>()

  for (const product of productRows) {
    inventoryByProduct.set(product.id, {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      germany: 0,
      inTransit: 0,
      bangladesh: 0,
      total: 0,
    })
  }

  for (const item of inventoryRows) {
    const product = productById.get(item.product_id)

    if (!product) continue

    const summary = inventoryByProduct.get(item.product_id)

    if (!summary) continue

    if (item.location === "germany") {
      summary.germany += item.quantity
    }

    if (item.location === "in_transit") {
      summary.inTransit += item.quantity
    }

    if (item.location === "bangladesh") {
      summary.bangladesh += item.quantity
    }

    summary.total += item.quantity
  }

  const saleAnalyticsRows = salesRows.map((sale) => ({
    id: sale.id,
    customerId: sale.customer_id,
    customerName: sale.customers?.name ?? null,
    productId: sale.product_id,
    productName:
      sale.products?.name ?? productById.get(sale.product_id)?.name ?? null,
    quantity: Number(sale.quantity),
    unitSellingPriceBdt: Number(sale.unit_selling_price_bdt),
    discount: sale.discount,
    saleDate: sale.sale_date,
  }))

  const customerInsights = calculateCustomerInsights({
    customers: customerRows.map((customer) => ({
      id: customer.id,
      name: customer.name,
      createdAt: customer.created_at,
    })),
    sales: saleAnalyticsRows,
    saleProfits: consumptionRows.map((row) => ({
      saleId: row.sale_id,
      grossProfit: Number(row.gross_profit),
    })),
  })

  const deliveryInsights = calculateDeliveryInsights(
    deliveryRows.map((delivery) => ({
      status: delivery.status,
      deliveryCost: Number(delivery.delivery_cost),
      deliveryCostPaidBy: delivery.delivery_cost_paid_by,
    })),
  )

  const totalRevenue = saleAnalyticsRows.reduce((sum, sale) => {
    return (
      sum +
      calculateSaleRevenue({
        quantity: sale.quantity,
        unitSellingPriceBdt: sale.unitSellingPriceBdt,
        discount: sale.discount,
      })
    )
  }, 0)

  const totalExpenses = expenseRows.reduce((sum, expense) => {
    if (expense.currency !== "BDT") return sum

    return sum + Number(expense.amount)
  }, 0)

  const totalFifoCost = consumptionRows.reduce((sum, consumption) => {
    return sum + Number(consumption.total_cost)
  }, 0)

  const totalGrossProfit = totalRevenue - totalFifoCost
  const netProfit = calculateNetProfit({
    revenue: totalRevenue,
    productCosts: totalFifoCost,
    expenses: totalExpenses + deliveryInsights.businessPaidDeliveryCost,
  })
  const profitMargin = calculateProfitMargin(totalGrossProfit, totalRevenue)

  const inventorySummaries = Array.from(inventoryByProduct.values())

  const germanyStock = inventorySummaries.reduce(
    (sum, item) => sum + item.germany,
    0,
  )
  const inTransitStock = inventorySummaries.reduce(
    (sum, item) => sum + item.inTransit,
    0,
  )
  const bangladeshStock = inventorySummaries.reduce(
    (sum, item) => sum + item.bangladesh,
    0,
  )

  const germanyInventoryValue = inventorySummaries.reduce((sum, item) => {
    const product = productById.get(item.productId)

    return sum + item.germany * Number(product?.purchase_price_bdt ?? 0)
  }, 0)

  const inTransitInventoryValue = inventorySummaries.reduce((sum, item) => {
    const product = productById.get(item.productId)

    return sum + item.inTransit * Number(product?.purchase_price_bdt ?? 0)
  }, 0)

  const bangladeshInventoryValue = inventoryBatchRows.reduce((sum, batch) => {
    return (
      sum +
      Number(batch.remaining_quantity) * Number(batch.landed_cost_per_unit)
    )
  }, 0)

  const totalInventoryValue =
    germanyInventoryValue + inTransitInventoryValue + bangladeshInventoryValue

  const bestSellingMap = new Map<
    string,
    { productName: string; quantitySold: number; revenue: number }
  >()

  for (const sale of saleAnalyticsRows) {
    const saleRevenue = calculateSaleRevenue({
      quantity: sale.quantity,
      unitSellingPriceBdt: sale.unitSellingPriceBdt,
      discount: sale.discount,
    })

    const existing = bestSellingMap.get(sale.productId) ?? {
      productName:
        sale.productName ?? productById.get(sale.productId)?.name ?? "Unknown product",
      quantitySold: 0,
      revenue: 0,
    }

    existing.quantitySold += sale.quantity
    existing.revenue += saleRevenue

    bestSellingMap.set(sale.productId, existing)
  }

  const topBestSellingProducts = Array.from(bestSellingMap.entries())
    .map(([productId, value]) => ({
      productId,
      ...value,
    }))
    .sort((left, right) => right.quantitySold - left.quantitySold)
    .slice(0, 5)

  const leastSellingProducts = calculateLeastSellingProducts({
    products: productRows.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
    })),
    sales: saleAnalyticsRows,
    limit: 5,
  })

  const profitabilityMap = new Map<
    string,
    {
      productName: string
      quantitySold: number
      grossProfit: number
    }
  >()

  for (const consumption of consumptionRows) {
    const existing = profitabilityMap.get(consumption.product_id) ?? {
      productName:
        productById.get(consumption.product_id)?.name ?? "Unknown product",
      quantitySold: 0,
      grossProfit: 0,
    }

    existing.quantitySold += Number(consumption.quantity)
    existing.grossProfit += Number(consumption.gross_profit)

    profitabilityMap.set(consumption.product_id, existing)
  }

  const topProfitableProducts = Array.from(profitabilityMap.entries())
    .map(([productId, value]) => ({
      productId,
      ...value,
    }))
    .sort((left, right) => right.grossProfit - left.grossProfit)
    .slice(0, 5)

  const lowStockAlerts = inventorySummaries
    .filter((item) => item.total <= 5)
    .sort(
      (left, right) =>
        left.total - right.total ||
        left.productName.localeCompare(right.productName),
    )

  const monthlyMap = new Map<string, MonthlyMetric>()

  for (const sale of saleAnalyticsRows) {
    const entry = getOrCreateMonthMetric(monthlyMap, sale.saleDate)

    entry.revenue += calculateSaleRevenue({
      quantity: sale.quantity,
      unitSellingPriceBdt: sale.unitSellingPriceBdt,
      discount: sale.discount,
    })
  }

  for (const expense of expenseRows) {
    if (expense.currency !== "BDT") continue

    const entry = getOrCreateMonthMetric(monthlyMap, expense.date)
    entry.expenses += Number(expense.amount)
  }

  for (const consumption of consumptionRows) {
    const saleDate = saleDateById.get(consumption.sale_id)

    if (!saleDate) continue

    const entry = getOrCreateMonthMetric(monthlyMap, saleDate)
    entry.grossProfit += Number(consumption.gross_profit)
  }

  const chartData = Array.from(monthlyMap.values())
    .map((entry) => ({
      ...entry,
      netProfit: entry.grossProfit - entry.expenses,
    }))
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey))
    .map<ChartMetric>(({ month, revenue, expenses, grossProfit, netProfit }) => ({
      month,
      revenue,
      expenses,
      grossProfit,
      netProfit,
    }))

  const leadingRevenueProduct = topBestSellingProducts[0]
  const leadingProfitProduct = topProfitableProducts[0]
  const lowStockCount = lowStockAlerts.length
  const topCustomers = customerInsights.topCustomers.slice(0, 5)
  const currentMonthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="min-w-0 space-y-10">
      <PageHeader
        title="Dashboard"
        description="Business-ready overview of revenue, FIFO profitability, customer momentum, delivery performance, and inventory health."
      />

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="eyebrow-label">Financial Snapshot</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">
            Core revenue and margin signals
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          <MetricCard
            title="Total Revenue"
            value={formatBDT(totalRevenue)}
            description="Recorded revenue from active sales."
          />
          <MetricCard
            title="FIFO Cost"
            value={formatBDT(totalFifoCost)}
            description="Sum of consumed inventory batch cost."
          />
          <MetricCard
            title="Gross Profit"
            value={formatBDT(totalGrossProfit)}
            description="Revenue minus FIFO cost."
          />
          <MetricCard
            title="Net Profit"
            value={formatBDT(netProfit)}
            description="Gross Profit - BDT expenses - business-paid delivery costs."
          />
          <MetricCard
            title="Profit Margin"
            value={formatPercent(profitMargin)}
            description="Gross profit as a share of revenue."
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="eyebrow-label">Customer Insights</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">
            Revenue quality, repeat buying, and customer momentum
          </h2>
        </div>

        {customerRows.length === 0 ? (
          <EmptyState
            title="No customers yet"
            description="Create customer profiles to unlock retention, leaderboard, and repeat-buyer analytics."
          />
        ) : (
          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                title="Best Customer by Revenue"
                value={
                  customerInsights.bestCustomerByRevenue?.customerName ?? "No sales yet"
                }
                description={
                  customerInsights.bestCustomerByRevenue
                    ? `${formatBDT(customerInsights.bestCustomerByRevenue.revenue)} across ${formatQuantity(customerInsights.bestCustomerByRevenue.ordersCount)} active orders`
                    : "Linked active sales will surface your strongest customer."
                }
              />
              <MetricCard
                title="Best Customer by Profit"
                value={
                  customerInsights.bestCustomerByProfit?.customerName ??
                  "No FIFO profit yet"
                }
                description={
                  customerInsights.bestCustomerByProfit
                    ? `${formatBDT(customerInsights.bestCustomerByProfit.profit)} FIFO-backed gross profit`
                    : "Profit rank appears once active sales have consumptions."
                }
              />
              <MetricCard
                title="Returning Customers"
                value={formatQuantity(customerInsights.returningCustomers)}
                description={`${formatPercent(customerInsights.retentionRate)} simple retention across all customers.`}
              />
              <MetricCard
                title="New Customers This Month"
                value={formatQuantity(customerInsights.newCustomersThisMonth)}
                description={`Profiles created in ${currentMonthLabel}.`}
              />
              <MetricCard
                title="Average Order Value"
                value={formatBDT(customerInsights.averageOrderValue)}
                description="Total active-sale revenue divided by active-sale count."
              />
              <MetricCard
                title="Retention Rate"
                value={formatPercent(customerInsights.retentionRate)}
                description={`${formatQuantity(customerInsights.returningCustomers)} of ${formatQuantity(customerInsights.totalCustomers)} customers have repeat orders.`}
              />
            </div>

            <Card className="min-w-0 border-border/60 bg-card/78">
              <CardHeader className="pb-3">
                <p className="eyebrow-label">Customer Leaderboard</p>
                <CardTitle>Top 5 customers</CardTitle>
                <CardDescription>
                  Ranked by active-sale revenue with recent order context.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topCustomers.length === 0 ? (
                  <EmptyState
                    title="No customer analytics yet"
                    description="Link customers to active sales to build the revenue leaderboard."
                  />
                ) : (
                  <div className="space-y-3">
                    {topCustomers.map((customer, index) => (
                      <div
                        key={customer.customerId}
                        className="surface-panel-subtle rounded-[1.45rem] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold tracking-[-0.02em] sm:text-base">
                              {customer.customerName}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Last order {formatDate(customer.lastOrderDate)}
                            </p>
                          </div>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="surface-tile px-3 py-3">
                            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                              Orders
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                              {formatQuantity(customer.ordersCount)}
                            </p>
                          </div>
                          <div className="surface-tile px-3 py-3">
                            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                              Revenue
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                              {formatBDT(customer.revenue)}
                            </p>
                          </div>
                          <div className="surface-tile px-3 py-3">
                            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                              Profit
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                              {customerInsights.hasProfitData
                                ? formatBDT(customer.profit)
                                : "Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="eyebrow-label">Delivery Insights</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">
            Fulfilment volume, cost ownership, and completion health
          </h2>
        </div>

        {deliveryInsights.totalDeliveries === 0 ? (
          <EmptyState
            title="No deliveries yet"
            description="Create linked deliveries to monitor completion rate, cost mix, and status distribution."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                title="Pending Deliveries"
                value={formatQuantity(deliveryInsights.pendingDeliveries)}
                description="Orders waiting to leave fulfilment."
              />
              <MetricCard
                title="Delivered Deliveries"
                value={formatQuantity(deliveryInsights.deliveredDeliveries)}
                description="Completed handoffs recorded in the system."
              />
              <MetricCard
                title="Cancelled Deliveries"
                value={formatQuantity(deliveryInsights.cancelledDeliveries)}
                description="Cancelled records excluded from completion rate."
              />
              <MetricCard
                title="Completion Rate"
                value={formatPercent(deliveryInsights.completionRate)}
                description="Delivered share of non-cancelled deliveries."
              />
              <MetricCard
                title="Business Delivery Cost"
                value={formatBDT(deliveryInsights.businessPaidDeliveryCost)}
                description="Only non-cancelled business-paid delivery cost."
              />
              <MetricCard
                title="Customer-Paid Share"
                value={formatPercent(
                  deliveryInsights.customerPaidDeliveryPercentage,
                )}
                description={`${formatBDT(deliveryInsights.averageDeliveryCost)} average cost on non-cancelled deliveries.`}
              />
            </div>

            <Card className="min-w-0 border-border/60 bg-card/78">
              <CardHeader className="pb-3">
                <p className="eyebrow-label">Delivery Performance</p>
                <CardTitle>Status distribution</CardTitle>
                <CardDescription>
                  Lightweight view of fulfilment progression across all delivery records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="surface-panel-subtle rounded-[1.45rem] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        Live Delivery Throughput
                      </p>
                      <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                        {formatPercent(deliveryInsights.completionRate)} completion
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatQuantity(deliveryInsights.nonCancelledDeliveries)} non-cancelled
                      {" · "}
                      {formatQuantity(deliveryInsights.totalDeliveries)} total
                    </div>
                  </div>

                  <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted/80">
                    {deliveryStatusOrder.map((status) => {
                      const count =
                        status === "pending"
                          ? deliveryInsights.pendingDeliveries
                          : status === "shipped"
                            ? deliveryInsights.shippedDeliveries
                            : status === "delivered"
                              ? deliveryInsights.deliveredDeliveries
                              : deliveryInsights.cancelledDeliveries

                      const width =
                        deliveryInsights.totalDeliveries === 0
                          ? 0
                          : (count / deliveryInsights.totalDeliveries) * 100

                      return (
                        <div
                          key={status}
                          className={deliveryStatusMeta[status].barClassName}
                          style={{ width: `${width}%` }}
                        />
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {deliveryStatusOrder.map((status) => {
                    const count =
                      status === "pending"
                        ? deliveryInsights.pendingDeliveries
                        : status === "shipped"
                          ? deliveryInsights.shippedDeliveries
                          : status === "delivered"
                            ? deliveryInsights.deliveredDeliveries
                            : deliveryInsights.cancelledDeliveries

                    const share =
                      deliveryInsights.totalDeliveries === 0
                        ? 0
                        : (count / deliveryInsights.totalDeliveries) * 100

                    return (
                      <div
                        key={status}
                        className="surface-tile flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <Badge
                          variant="outline"
                          className={deliveryStatusMeta[status].badgeClassName}
                        >
                          {deliveryStatusMeta[status].label}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatQuantity(count)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercent(share)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="eyebrow-label">Inventory Pulse</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">
            Stock position across operating locations
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Germany Stock"
            value={formatQuantity(germanyStock)}
            description={formatBDT(germanyInventoryValue)}
          />
          <MetricCard
            title="In Transit Stock"
            value={formatQuantity(inTransitStock)}
            description={`${formatBDT(inTransitInventoryValue)} estimated value`}
          />
          <MetricCard
            title="Bangladesh Stock"
            value={formatQuantity(bangladeshStock)}
            description={formatBDT(bangladeshInventoryValue)}
          />
          <MetricCard
            title="Inventory Value"
            value={formatBDT(totalInventoryValue)}
            description="Germany + in transit estimate + Bangladesh FIFO value."
          />
        </div>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <RevenueExpenseChart data={chartData} />

        <Card className="h-full min-w-0 border-border/60 bg-card/76">
          <CardHeader className="pb-3">
            <p className="eyebrow-label">Workspace Pulse</p>
            <CardTitle>What stands out this period</CardTitle>
            <CardDescription>
              High-signal operational cues pulled from the latest activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="surface-tile px-4 py-4">
              <p className="eyebrow-label">Top Revenue Driver</p>
              <p className="mt-2 text-base font-semibold tracking-[-0.03em]">
                {leadingRevenueProduct?.productName ?? "No sales yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/95">
                {leadingRevenueProduct
                  ? `${formatQuantity(leadingRevenueProduct.quantitySold)} units · ${formatBDT(leadingRevenueProduct.revenue)} revenue`
                  : "Record sales to surface your leading product."}
              </p>
            </div>

            <div className="surface-tile px-4 py-4">
              <p className="eyebrow-label">Top Profit Contributor</p>
              <p className="mt-2 text-base font-semibold tracking-[-0.03em]">
                {leadingProfitProduct?.productName ?? "No FIFO data yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/95">
                {leadingProfitProduct
                  ? `${formatBDT(leadingProfitProduct.grossProfit)} gross profit across ${formatQuantity(leadingProfitProduct.quantitySold)} units`
                  : "Complete intake and sales to calculate FIFO-backed profitability."}
              </p>
            </div>

            <div className="surface-tile px-4 py-4">
              <p className="eyebrow-label">Replenishment Watch</p>
              <p className="mt-2 text-base font-semibold tracking-[-0.03em]">
                {lowStockCount === 0
                  ? "All products look healthy"
                  : `${formatQuantity(lowStockCount)} products need attention`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/95">
                {lowStockCount === 0
                  ? "No products are currently at five units or below."
                  : "Use the low-stock insight table below to prioritize replenishment."}
              </p>
            </div>

            <div className="surface-tile px-4 py-4">
              <p className="eyebrow-label">Delivery Cost Pressure</p>
              <p className="mt-2 text-base font-semibold tracking-[-0.03em]">
                {deliveryInsights.totalDeliveries === 0
                  ? "No delivery telemetry yet"
                  : `${formatBDT(deliveryInsights.averageDeliveryCost)} average per live delivery`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/95">
                {deliveryInsights.totalDeliveries === 0
                  ? "Track deliveries to understand completion and cost ownership."
                  : `${formatPercent(deliveryInsights.customerPaidDeliveryPercentage)} customer-paid share across all delivery records.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="eyebrow-label">Operational Insights</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">
            Product movement and replenishment watchlist
          </h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          <DashboardTableCard
            title="Top 5 Best-Selling Products"
            description="Ranked by total active quantity sold."
            columns={["Product", "Units Sold", "Revenue"]}
            rows={
              topBestSellingProducts.length > 0
                ? topBestSellingProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>{formatQuantity(product.quantitySold)}</TableCell>
                      <TableCell>{formatBDT(product.revenue)}</TableCell>
                    </TableRow>
                  ))
                : null
            }
            emptyTitle="No sales yet"
            emptyDescription="Create sales to surface the best-selling product list."
          />

          <DashboardTableCard
            title="Top 5 Most Profitable Products"
            description="Based on FIFO-backed gross profit from sale batch consumptions."
            columns={["Product", "Units Sold", "Gross Profit"]}
            rows={
              topProfitableProducts.length > 0
                ? topProfitableProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>{formatQuantity(product.quantitySold)}</TableCell>
                      <TableCell>{formatBDT(product.grossProfit)}</TableCell>
                    </TableRow>
                  ))
                : null
            }
            emptyTitle="No FIFO profitability yet"
            emptyDescription="Complete stock intake and sales so FIFO consumptions can populate profitability."
          />

          <DashboardTableCard
            title="5 Least-Selling Products"
            description="Slow movers among products with at least one active sale."
            columns={["Product", "Units Sold", "Revenue"]}
            rows={
              leastSellingProducts.length > 0
                ? leastSellingProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        <div className="min-w-0">
                          <p>{product.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatQuantity(product.quantitySold)}</TableCell>
                      <TableCell>{formatBDT(product.revenue)}</TableCell>
                    </TableRow>
                  ))
                : null
            }
            emptyTitle="No sales-driven product analytics yet"
            emptyDescription="Active sales will surface your slowest-moving sold products."
          />

          <DashboardTableCard
            title="Low Stock Alerts"
            description="Products with total stock of 5 units or fewer across all locations."
            columns={["Product", "SKU", "Total Stock", "Status"]}
            rows={
              lowStockAlerts.length > 0
                ? lowStockAlerts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{formatQuantity(product.total)}</TableCell>
                      <TableCell>
                        <Badge variant={getStockBadgeVariant(product.total)}>
                          {getStockBadgeLabel(product.total)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                : null
            }
            emptyTitle="No low stock alerts"
            emptyDescription="All tracked products currently have more than 5 units available."
          />
        </div>
      </section>
    </div>
  )
}
