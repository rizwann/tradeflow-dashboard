import { MetricCard } from "@/components/shared/metric-card"
import { createClient } from "@/lib/supabase/server"
import { MonthlyReportChart } from "@/features/reports/monthly-report-chart"
import { ProductProfitTable } from "@/features/reports/product-profit-table"
import { ShipmentProfitTable } from "@/features/reports/shipment-profit-table"
import { calculateProductProfit } from "@/features/reports/report-calculations"

type SaleRow = {
  product_id: string
  quantity: number
  unit_selling_price_bdt: number
  discount: number
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
  inventory_batches: {
    shipment_id: string | null
  } | null
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function getMonthKey(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    year: "2-digit",
  })
}

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select(
      "product_id, quantity, unit_selling_price_bdt, discount, sale_date, products(name)",
    )
    .returns<SaleRow[]>()

  const { data: saleBatchConsumptions, error: saleBatchError } = await supabase
    .from("sale_batch_consumptions")
    .select(
      `
      sale_id,
      product_id,
      quantity,
      total_cost,
      inventory_batches (
        shipment_id
      )
    `,
    )
    .returns<SaleBatchConsumptionRow[]>()

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, currency, date")
    .returns<ExpenseRow[]>()

  const { data: shipmentProfitSource, error: shipmentProfitError } =
    await supabase
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
      .returns<ShipmentProfitSourceRow[]>()

  if (salesError || saleBatchError || expensesError || shipmentProfitError) {
    return (
      <div className="rounded-xl border bg-background p-6">
        <h1 className="text-xl font-semibold">Could not load reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh the page or try again later.
        </p>
      </div>
    )
  }

  const fifoCostByProduct = new Map<string, number>()

  for (const consumption of saleBatchConsumptions ?? []) {
    fifoCostByProduct.set(
      consumption.product_id,
      (fifoCostByProduct.get(consumption.product_id) ?? 0) +
        Number(consumption.total_cost),
    )
  }

  const productMap = new Map<
    string,
    {
      productId: string
      productName: string
      quantitySold: number
      revenue: number
      fifoCost: number
    }
  >()

  for (const sale of sales ?? []) {
    const revenue =
      sale.quantity * sale.unit_selling_price_bdt - Number(sale.discount ?? 0)

    const existing = productMap.get(sale.product_id) ?? {
      productId: sale.product_id,
      productName: sale.products?.name ?? "Unknown product",
      quantitySold: 0,
      revenue: 0,
      fifoCost: fifoCostByProduct.get(sale.product_id) ?? 0,
    }

    existing.quantitySold += sale.quantity
    existing.revenue += revenue

    productMap.set(sale.product_id, existing)
  }

  const productProfitRows = calculateProductProfit(
    Array.from(productMap.values()),
  ).sort((a, b) => b.grossProfit - a.grossProfit)

  const revenueByProduct = new Map<
    string,
    {
      quantitySold: number
      revenue: number
    }
  >()

  for (const sale of sales ?? []) {
    const revenue =
      sale.quantity * sale.unit_selling_price_bdt - Number(sale.discount ?? 0)

    const existing = revenueByProduct.get(sale.product_id) ?? {
      quantitySold: 0,
      revenue: 0,
    }

    existing.quantitySold += sale.quantity
    existing.revenue += revenue

    revenueByProduct.set(sale.product_id, existing)
  }

  const shipmentCostMap = new Map<
    string,
    {
      shipmentId: string
      landedCost: number
    }
  >()

  for (const consumption of saleBatchConsumptions ?? []) {
    const shipmentId = consumption.inventory_batches?.shipment_id

    if (!shipmentId) continue

    const existing = shipmentCostMap.get(shipmentId) ?? {
      shipmentId,
      landedCost: 0,
    }

    existing.landedCost += Number(consumption.total_cost)

    shipmentCostMap.set(shipmentId, existing)
  }

  const shipmentRevenueMap = new Map<
    string,
    {
      shipmentId: string
      estimatedRevenue: number
    }
  >()

  for (const consumption of saleBatchConsumptions ?? []) {
    const shipmentId = consumption.inventory_batches?.shipment_id

    if (!shipmentId) continue

    const productRevenue = revenueByProduct.get(consumption.product_id)

    const averageRevenuePerUnit =
      productRevenue && productRevenue.quantitySold > 0
        ? productRevenue.revenue / productRevenue.quantitySold
        : 0

    const existing = shipmentRevenueMap.get(shipmentId) ?? {
      shipmentId,
      estimatedRevenue: 0,
    }

    existing.estimatedRevenue += averageRevenuePerUnit * consumption.quantity

    shipmentRevenueMap.set(shipmentId, existing)
  }

  const shipmentProfitRows = (shipmentProfitSource ?? [])
    .map((shipment) => {
      const totalQuantity = shipment.shipment_items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      )

      const landedCost = shipmentCostMap.get(shipment.id)?.landedCost ?? 0

      const estimatedRevenue =
        shipmentRevenueMap.get(shipment.id)?.estimatedRevenue ?? 0

      const grossProfit = estimatedRevenue - landedCost
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

  const totalExpenses = (expenses ?? []).reduce((sum, expense) => {
    if (expense.currency !== "BDT") return sum
    return sum + expense.amount
  }, 0)

  const netProfit = totalGrossProfit - totalExpenses

  const monthlyMap = new Map<
    string,
    {
      month: string
      revenue: number
      expenses: number
    }
  >()

  for (const sale of sales ?? []) {
    const month = getMonthKey(sale.sale_date)

    const existing = monthlyMap.get(month) ?? {
      month,
      revenue: 0,
      expenses: 0,
    }

    existing.revenue +=
      sale.quantity * sale.unit_selling_price_bdt - Number(sale.discount ?? 0)

    monthlyMap.set(month, existing)
  }

  for (const expense of expenses ?? []) {
    if (expense.currency !== "BDT") continue

    const month = getMonthKey(expense.date)

    const existing = monthlyMap.get(month) ?? {
      month,
      revenue: 0,
      expenses: 0,
    }

    existing.expenses += expense.amount

    monthlyMap.set(month, existing)
  }

  const monthlyData = Array.from(monthlyMap.values())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Analyze FIFO profitability, shipment performance, and monthly business
          trends.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatBDT(totalRevenue)}
          description="From recorded sales"
        />
        <MetricCard
          title="FIFO Cost"
          value={formatBDT(totalLandedCost)}
          description="Actual consumed batch cost"
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
      </div>

      <MonthlyReportChart data={monthlyData} />

      <div>
        <h2 className="mb-3 text-xl font-semibold">Profit by product</h2>
        <ProductProfitTable rows={productProfitRows} />
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">Profit by shipment</h2>
        <ShipmentProfitTable rows={shipmentProfitRows} />
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        Business note: product profit now uses actual FIFO batch costs from
        recorded sales. Shipment landed cost is also based on actual consumed
        batches. Shipment revenue is still estimated from average product
        selling price because sale revenue is not yet allocated per consumed
        batch.
      </div>
    </div>
  )
}
