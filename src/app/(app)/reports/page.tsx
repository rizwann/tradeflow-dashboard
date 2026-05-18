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
  calculateSaleRevenue,
} from "@/features/analytics/customer-delivery-analytics"
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

const deliveryStatusOrder = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
] as const

const deliveryStatusMeta: Record<
  DeliveryCostRow["status"],
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

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Reports"
        description="Analyze FIFO profitability, top customers, delivery cost efficiency, and monthly business trends."
        actions={
          <ReportsExportButtons
            productRows={productProfitRows}
            shipmentRows={shipmentProfitRows}
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
          description="Gross profit minus BDT expenses and business-paid delivery costs."
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
                  Active-sale revenue, order count, FIFO profit, and last order date.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:hidden">
                  {topCustomers.map((customer, index) => (
                    <div
                      key={customer.customerId}
                      className="surface-panel-subtle rounded-[1.45rem] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold tracking-[-0.02em]">
                            {customer.customerName}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Last order {formatDate(customer.lastOrderDate)}
                          </p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
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
                        <div className="surface-tile px-3 py-3 col-span-2">
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

                <div className="hidden md:block overflow-x-auto">
                  <Table className="min-w-[44rem]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                        <TableHead>Last Order</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCustomers.map((customer) => (
                        <TableRow key={customer.customerId}>
                          <TableCell className="font-medium">
                            {customer.customerName}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatQuantity(customer.ordersCount)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatBDT(customer.revenue)}
                          </TableCell>
                          <TableCell className="text-right">
                            {customerInsights.hasProfitData
                              ? formatBDT(customer.profit)
                              : "Pending"}
                          </TableCell>
                          <TableCell>{formatDate(customer.lastOrderDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                title="Average Delivery Cost"
                value={formatBDT(deliveryInsights.averageDeliveryCost)}
                description="Average across all non-cancelled deliveries."
              />
              <MetricCard
                title="Customer-Paid Share"
                value={formatPercent(
                  deliveryInsights.customerPaidDeliveryPercentage,
                )}
                description="Customer-paid deliveries as a share of all delivery records."
              />
            </div>

            <Card className="border-border/60 bg-card/78">
              <CardHeader className="pb-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Delivery Completion Summary
                </p>
                <CardTitle>Status mix</CardTitle>
                <CardDescription>
                  Compact view of the pending-to-delivered pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="surface-panel-subtle rounded-[1.45rem] p-4">
                  <div className="flex h-3 overflow-hidden rounded-full bg-muted/80">
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

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {deliveryStatusOrder.map((status) => {
                    const count =
                      status === "pending"
                        ? deliveryInsights.pendingDeliveries
                        : status === "shipped"
                          ? deliveryInsights.shippedDeliveries
                          : status === "delivered"
                            ? deliveryInsights.deliveredDeliveries
                            : deliveryInsights.cancelledDeliveries

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
                        <p className="text-sm font-semibold">
                          {formatQuantity(count)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
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
