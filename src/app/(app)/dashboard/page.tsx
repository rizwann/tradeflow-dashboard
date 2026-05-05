import type { ReactNode } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { RevenueExpenseChart } from "@/features/dashboard/revenue-expense-chart"
import { calculateNetProfit, calculateProfitMargin } from "@/lib/calculations"
import { createClient } from "@/lib/supabase/server"
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

type SaleRow = {
  id: string
  product_id: string
  quantity: number
  unit_selling_price_bdt: number
  discount: number | null
  sale_date: string
  products: {
    name: string
  } | null
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

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatQuantity(value: number) {
  return value.toLocaleString("en-US")
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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows ? (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{rows}</TableBody>
          </Table>
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
    { data: expenses, error: expensesError },
    { data: inventory, error: inventoryError },
    { data: products, error: productsError },
    { data: saleBatchConsumptions, error: saleBatchError },
    { data: inventoryBatches, error: inventoryBatchesError },
  ] = await Promise.all([
    supabase
      .from("sales")
      .select(
        "id, product_id, quantity, unit_selling_price_bdt, discount, sale_date, products(name)",
      )
      .returns<SaleRow[]>(),
    supabase.from("expenses").select("amount, currency, date").returns<
      ExpenseRow[]
    >(),
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
      .select("sale_id, product_id, quantity, total_cost, gross_profit")
      .returns<SaleBatchConsumptionRow[]>(),
    supabase
      .from("inventory_batches")
      .select("product_id, remaining_quantity, landed_cost_per_unit")
      .gt("remaining_quantity", 0)
      .returns<InventoryBatchRow[]>(),
  ])

  if (
    salesError ||
    expensesError ||
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
          expensesError?.message ??
          inventoryError?.message ??
          productsError?.message ??
          saleBatchError?.message ??
          inventoryBatchesError?.message
        }
      />
    )
  }

  const salesRows = sales ?? []
  const expenseRows = expenses ?? []
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

  const totalRevenue = salesRows.reduce((sum, sale) => {
    return (
      sum +
      sale.quantity * sale.unit_selling_price_bdt -
      Number(sale.discount ?? 0)
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
    expenses: totalExpenses,
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

  for (const sale of salesRows) {
    const existing = bestSellingMap.get(sale.product_id) ?? {
      productName:
        sale.products?.name ??
        productById.get(sale.product_id)?.name ??
        "Unknown product",
      quantitySold: 0,
      revenue: 0,
    }

    existing.quantitySold += sale.quantity
    existing.revenue +=
      sale.quantity * sale.unit_selling_price_bdt - Number(sale.discount ?? 0)

    bestSellingMap.set(sale.product_id, existing)
  }

  const topBestSellingProducts = Array.from(bestSellingMap.entries())
    .map(([productId, value]) => ({
      productId,
      ...value,
    }))
    .sort((left, right) => right.quantitySold - left.quantitySold)
    .slice(0, 5)

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

  for (const sale of salesRows) {
    const entry = getOrCreateMonthMetric(monthlyMap, sale.sale_date)

    entry.revenue +=
      sale.quantity * sale.unit_selling_price_bdt - Number(sale.discount ?? 0)
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
    .map(({ sortKey: _sortKey, ...entry }) => entry)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Business-ready overview of revenue, FIFO profitability, inventory health, and product performance."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Revenue"
          value={formatBDT(totalRevenue)}
          description="Recorded sales revenue"
        />
        <MetricCard
          title="FIFO Cost"
          value={formatBDT(totalFifoCost)}
          description="Sum of consumed batch costs"
        />
        <MetricCard
          title="Gross Profit"
          value={formatBDT(totalGrossProfit)}
          description="Revenue minus FIFO cost"
        />
        <MetricCard
          title="Net Profit"
          value={formatBDT(netProfit)}
          description="Gross profit minus BDT expenses"
        />
        <MetricCard
          title="Profit Margin"
          value={formatPercent(profitMargin)}
          description="Gross profit as share of revenue"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          description="Germany + in transit estimate + Bangladesh FIFO value"
        />
      </section>

      <RevenueExpenseChart data={chartData} />

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardTableCard
          title="Top 5 Best-Selling Products"
          description="Ranked by total quantity sold."
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
      </section>
    </div>
  )
}
