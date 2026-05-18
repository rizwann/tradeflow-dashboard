import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  calculateCustomerInsights,
  calculateDeliveryInsights,
  calculateSaleRevenue,
} from "@/features/analytics/customer-delivery-analytics"
import { CustomerPerformanceTable } from "@/features/reports/customer-performance-table"
import { DeliveryPerformanceSummary } from "@/features/reports/delivery-performance-summary"
import { MonthlyReportChart } from "@/features/reports/monthly-report-chart"
import { ProductProfitTable } from "@/features/reports/product-profit-table"
import { ReportsExportButtons } from "@/features/reports/reports-export-buttons"
import {
  calculateProductProfit,
  type ProductProfitInput,
} from "@/features/reports/report-calculations"
import { ShipmentProfitTable } from "@/features/reports/shipment-profit-table"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Reports",
}

type SaleRow = {
  id: string
  customer_id: string | null
  product_id: string
  quantity: number
  unit_selling_price_bdt: number
  discount: number | null
  sale_date: string
  status: "active" | "voided"
  products: {
    name: string
  } | null
  customers: {
    name: string
  } | null
}

type ExpenseRow = {
  amount: number
  currency: string
  date: string
}

type DeliveryCostRow = {
  status: "pending" | "shipped" | "delivered" | "cancelled"
  delivery_cost: number
  delivery_cost_paid_by: "business" | "customer"
}

type ShipmentProfitSourceRow = {
  id: string
  shipment_code: string
  shipment_items: {
    product_id: string
    quantity: number
  }[]
}

type SaleBatchConsumptionRow = {
  sale_id: string
  product_id: string
  quantity: number
  total_cost: number
  total_revenue: number
  gross_profit: number
  sales: {
    status: "active" | "voided"
  } | null
  inventory_batches: {
    shipment_id: string | null
  } | null
}

type MonthlyMetric = {
  sortKey: string
  month: string
  revenue: number
  expenses: number
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
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
  }

  monthlyMap.set(sortKey, nextValue)

  return nextValue
}

export default async function ReportsPage() {
  const supabase = await createClient()

  const [
    { data: sales, error: salesError },
    { data: saleBatchConsumptions, error: saleBatchError },
    { data: expenses, error: expensesError },
    { data: deliveries, error: deliveriesError },
    { data: shipmentProfitSource, error: shipmentProfitError },
  ] = await Promise.all([
    supabase
      .from("sales")
      .select(
        "id, customer_id, product_id, quantity, unit_selling_price_bdt, discount, sale_date, status, products(name), customers(name)",
      )
      .eq("status", "active")
      .returns<SaleRow[]>(),
    supabase
      .from("sale_batch_consumptions")
      .select(
        `
      sale_id,
      product_id,
      quantity,
      total_cost,
      total_revenue,
      gross_profit,
      sales!inner (
        status
      ),
      inventory_batches (
        shipment_id
      )
    `,
      )
      .eq("sales.status", "active")
      .returns<SaleBatchConsumptionRow[]>(),
    supabase.from("expenses").select("amount, currency, date").returns<
      ExpenseRow[]
    >(),
    supabase
      .from("sales_deliveries")
      .select("status, delivery_cost, delivery_cost_paid_by")
      .returns<DeliveryCostRow[]>(),
    supabase
      .from("shipments")
      .select(
        `
        id,
        shipment_code,
        shipment_items (
          product_id,
          quantity
        )
      `,
      )
      .returns<ShipmentProfitSourceRow[]>(),
  ])

  if (
    salesError ||
    saleBatchError ||
    expensesError ||
    deliveriesError ||
    shipmentProfitError
  ) {
    return (
      <ErrorState
        title="Could not load reports"
        message={
          salesError?.message ??
          saleBatchError?.message ??
          expensesError?.message ??
          deliveriesError?.message ??
          shipmentProfitError?.message ??
          "Please refresh the page or try again later."
        }
      />
    )
  }

  const salesRows = sales ?? []
  const consumptionRows = saleBatchConsumptions ?? []
  const expenseRows = expenses ?? []
  const deliveryRows = deliveries ?? []
  const shipmentRows = shipmentProfitSource ?? []

  const salesAnalyticsRows = salesRows.map((sale) => ({
    id: sale.id,
    customerId: sale.customer_id,
    customerName: sale.customers?.name ?? null,
    productId: sale.product_id,
    productName: sale.products?.name ?? null,
    quantity: Number(sale.quantity),
    unitSellingPriceBdt: Number(sale.unit_selling_price_bdt),
    discount: sale.discount,
    saleDate: sale.sale_date,
  }))

  const customerInsights = calculateCustomerInsights({
    sales: salesAnalyticsRows,
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

  const fifoCostByProduct = new Map<string, number>()

  for (const consumption of consumptionRows) {
    fifoCostByProduct.set(
      consumption.product_id,
      (fifoCostByProduct.get(consumption.product_id) ?? 0) +
        Number(consumption.total_cost),
    )
  }

  const productMap = new Map<string, ProductProfitInput>()

  for (const sale of salesAnalyticsRows) {
    const revenue = calculateSaleRevenue({
      quantity: sale.quantity,
      unitSellingPriceBdt: sale.unitSellingPriceBdt,
      discount: sale.discount,
    })

    const existing = productMap.get(sale.productId) ?? {
      productId: sale.productId,
      productName: sale.productName ?? "Unknown product",
      quantitySold: 0,
      revenue: 0,
      fifoCost: fifoCostByProduct.get(sale.productId) ?? 0,
    }

    existing.quantitySold += sale.quantity
    existing.revenue += revenue

    productMap.set(sale.productId, existing)
  }

  const productProfitRows = calculateProductProfit(
    Array.from(productMap.values()),
  ).sort((a, b) => b.grossProfit - a.grossProfit)

  const shipmentProfitMap = new Map<
    string,
    {
      shipmentId: string
      landedCost: number
      revenue: number
      grossProfit: number
    }
  >()

  for (const consumption of consumptionRows) {
    const shipmentId = consumption.inventory_batches?.shipment_id

    if (!shipmentId) continue

    const existing = shipmentProfitMap.get(shipmentId) ?? {
      shipmentId,
      landedCost: 0,
      revenue: 0,
      grossProfit: 0,
    }

    existing.landedCost += Number(consumption.total_cost)
    existing.revenue += Number(consumption.total_revenue)
    existing.grossProfit += Number(consumption.gross_profit)

    shipmentProfitMap.set(shipmentId, existing)
  }

  const shipmentProfitRows = shipmentRows
    .map((shipment) => {
      const totalQuantity = shipment.shipment_items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      )

      const shipmentProfit = shipmentProfitMap.get(shipment.id)

      const landedCost = shipmentProfit?.landedCost ?? 0
      const estimatedRevenue = shipmentProfit?.revenue ?? 0
      const grossProfit = shipmentProfit?.grossProfit ?? 0
      const margin =
        estimatedRevenue === 0 ? 0 : (grossProfit / estimatedRevenue) * 100

      return {
        shipmentId: shipment.id,
        shipmentCode: shipment.shipment_code,
        totalQuantity,
        estimatedRevenue,
        landedCost,
        grossProfit,
        margin,
      }
    })
    .sort((a, b) => b.grossProfit - a.grossProfit)

  const totalRevenue = productProfitRows.reduce(
    (sum, row) => sum + row.revenue,
    0,
  )

  const totalLandedCost = productProfitRows.reduce(
    (sum, row) => sum + row.landedCostTotal,
    0,
  )

  const totalGrossProfit = productProfitRows.reduce(
    (sum, row) => sum + row.grossProfit,
    0,
  )

  const totalExpenses = expenseRows.reduce((sum, expense) => {
    if (expense.currency !== "BDT") return sum
    return sum + Number(expense.amount)
  }, 0)

  const netProfit =
    totalGrossProfit -
    totalExpenses -
    deliveryInsights.businessPaidDeliveryCost

  const monthlyMap = new Map<string, MonthlyMetric>()

  for (const sale of salesAnalyticsRows) {
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

  const monthlyData = Array.from(monthlyMap.values()).sort((left, right) =>
    left.sortKey.localeCompare(right.sortKey),
  )

  const topCustomers = customerInsights.topCustomers.slice(0, 5)
  const reportCustomerExportRows = customerInsights.topCustomers.map((customer) => ({
    customerName: customer.customerName,
    ordersCount: customer.ordersCount,
    revenue: customer.revenue,
    profit: customer.profit,
    averageOrderValue: customer.averageOrderValue,
    lastOrderDate: customer.lastOrderDate,
  }))
  const reportDeliveryExportRows = deliveryRows.map((delivery) => ({
    status: delivery.status,
    deliveryCost: Number(delivery.delivery_cost),
    deliveryCostPaidBy: delivery.delivery_cost_paid_by,
  }))

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Reports"
        description="Analyze FIFO profitability, top customers, delivery cost efficiency, and monthly business trends."
        actions={
          <ReportsExportButtons
            productRows={productProfitRows}
            shipmentRows={shipmentProfitRows}
            customerRows={reportCustomerExportRows}
            deliveryRows={reportDeliveryExportRows}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatBDT(totalRevenue)}
          description="From active recorded sales."
        />
        <MetricCard
          title="FIFO Cost"
          value={formatBDT(totalLandedCost)}
          description="Actual consumed batch cost."
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
      </div>

      <MonthlyReportChart data={monthlyData} />

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Customer Profitability
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Buyer value and repeat-order quality
          </h2>
        </div>

        {topCustomers.length === 0 ? (
          <EmptyState
            title="No customer analytics yet"
            description="Link customers to active sales to populate profitability and leaderboard reporting."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Best Customer by Revenue"
                value={
                  customerInsights.bestCustomerByRevenue?.customerName ??
                  "No customer sales"
                }
                description={
                  customerInsights.bestCustomerByRevenue
                    ? `${formatBDT(customerInsights.bestCustomerByRevenue.revenue)} across ${formatQuantity(customerInsights.bestCustomerByRevenue.ordersCount)} orders`
                    : "Customer-linked active sales are required."
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
                description="Customers with more than one active linked sale."
              />
              <MetricCard
                title="Average Order Value"
                value={formatBDT(customerInsights.averageOrderValue)}
                description="Total active-sale revenue divided by active-sale count."
              />
            </div>

            <Card className="min-w-0 border-border/60 bg-card/78">
              <CardHeader className="pb-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Top Customers
                </p>
                <CardTitle>Revenue-ranked customer table</CardTitle>
                <CardDescription>
                  Active-sale revenue, FIFO-backed profit, order count, average order value, and last order date.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerPerformanceTable
                  rows={topCustomers}
                  hasProfitData={customerInsights.hasProfitData}
                />
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Delivery Summary
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Cost ownership and completion performance
          </h2>
        </div>

        {deliveryInsights.totalDeliveries === 0 ? (
          <EmptyState
            title="No delivery analytics yet"
            description="Linked delivery records will populate completion and cost reporting here."
          />
        ) : (
          <DeliveryPerformanceSummary insights={deliveryInsights} />
        )}
      </section>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Product View
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Profit by product
          </h2>
        </div>
        <ProductProfitTable rows={productProfitRows} />
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Shipment View
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Profit by shipment
          </h2>
        </div>
        <ShipmentProfitTable rows={shipmentProfitRows} />
      </div>
    </div>
  )
}
