import { MetricCard } from "@/components/shared/metric-card"
import { createClient } from "@/lib/supabase/server"
import { ProductProfitTable } from "@/features/reports/product-profit-table"
import { MonthlyReportChart } from "@/features/reports/monthly-report-chart"
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
    purchase_price_bdt: number
  } | null
}

type ExpenseRow = {
  amount: number
  currency: string
  date: string
}

type ShipmentItemRow = {
  product_id: string
  landed_cost_per_unit: number
  quantity: number
}

type ShipmentProfitSourceRow = {
  id: string
  shipment_code: string
  shipment_items: {
    product_id: string
    quantity: number
    landed_cost_per_unit: number
    products: {
      purchase_price_bdt: number
    } | null
  }[]
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

function getAverageShipmentCostPerUnit(
  shipmentItems: ShipmentItemRow[],
  productId: string,
) {
  const items = shipmentItems.filter((item) => item.product_id === productId)

  if (items.length === 0) return 0

  const totalAllocatedCost = items.reduce((sum, item) => {
    return sum + Number(item.landed_cost_per_unit) * item.quantity
  }, 0)

  const totalQuantity = items.reduce((sum, item) => {
    return sum + item.quantity
  }, 0)

  if (totalQuantity === 0) return 0

  return totalAllocatedCost / totalQuantity
}

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select(
      "product_id, quantity, unit_selling_price_bdt, discount, sale_date, products(name, purchase_price_bdt)",
    )
    .returns<SaleRow[]>()

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, currency, date")
    .returns<ExpenseRow[]>()

  const { data: shipmentItems, error: shipmentItemsError } = await supabase
    .from("shipment_items")
    .select("product_id, landed_cost_per_unit, quantity")
    .returns<ShipmentItemRow[]>()

  const { data: shipmentProfitSource, error: shipmentProfitError } =
    await supabase
      .from("shipments")
      .select(
        `
        id,
        shipment_code,
        shipment_items (
          product_id,
          quantity,
          landed_cost_per_unit,
          products (
            purchase_price_bdt
          )
        )
      `,
      )
      .returns<ShipmentProfitSourceRow[]>()

  if (
    salesError ||
    expensesError ||
    shipmentItemsError ||
    shipmentProfitError
  ) {
    return (
      <div className="rounded-xl border bg-background p-6">
        <h1 className="text-xl font-semibold">Could not load reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh the page or try again later.
        </p>
      </div>
    )
  }

  const productMap = new Map<
    string,
    {
      productId: string
      productName: string
      landedCostPerUnit: number
      quantitySold: number
      revenue: number
    }
  >()

  for (const sale of sales ?? []) {
    const revenue =
      sale.quantity * sale.unit_selling_price_bdt - Number(sale.discount ?? 0)

    const purchasePriceBDT = Number(sale.products?.purchase_price_bdt ?? 0)

    const allocatedShipmentCostPerUnit = getAverageShipmentCostPerUnit(
      shipmentItems ?? [],
      sale.product_id,
    )

    const landedCostPerUnit = purchasePriceBDT + allocatedShipmentCostPerUnit

    const existing = productMap.get(sale.product_id) ?? {
      productId: sale.product_id,
      productName: sale.products?.name ?? "Unknown product",
      landedCostPerUnit,
      quantitySold: 0,
      revenue: 0,
    }

    existing.quantitySold += sale.quantity
    existing.revenue += revenue

    productMap.set(sale.product_id, existing)
  }

  const productProfitRows = calculateProductProfit(
    Array.from(productMap.values()),
  ).sort((a, b) => b.grossProfit - a.grossProfit)

  const salesByProduct = new Map<
    string,
    {
      quantitySold: number
      revenue: number
    }
  >()

  for (const sale of sales ?? []) {
    const revenue =
      sale.quantity * sale.unit_selling_price_bdt - Number(sale.discount ?? 0)

    const existing = salesByProduct.get(sale.product_id) ?? {
      quantitySold: 0,
      revenue: 0,
    }

    existing.quantitySold += sale.quantity
    existing.revenue += revenue

    salesByProduct.set(sale.product_id, existing)
  }

  const shipmentProfitRows = (shipmentProfitSource ?? [])
    .map((shipment) => {
      let totalQuantity = 0
      let landedCost = 0
      let estimatedRevenue = 0

      for (const item of shipment.shipment_items ?? []) {
        const purchasePriceBDT = Number(item.products?.purchase_price_bdt ?? 0)

        const fullLandedCostPerUnit =
          purchasePriceBDT + Number(item.landed_cost_per_unit ?? 0)

        const itemLandedCost = fullLandedCostPerUnit * item.quantity

        const productSales = salesByProduct.get(item.product_id)

        const averageRevenuePerUnit =
          productSales && productSales.quantitySold > 0
            ? productSales.revenue / productSales.quantitySold
            : 0

        const estimatedItemRevenue = averageRevenuePerUnit * item.quantity

        totalQuantity += item.quantity
        landedCost += itemLandedCost
        estimatedRevenue += estimatedItemRevenue
      }

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
          Analyze landed cost, product profitability, and monthly business
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
          title="Landed Cost"
          value={formatBDT(totalLandedCost)}
          description="Purchase + allocated shipment costs"
        />
        <MetricCard
          title="Gross Profit"
          value={formatBDT(totalGrossProfit)}
          description="Revenue minus landed cost"
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
        Business note: product profitability uses average allocated
        shipment/customs cost per product. Shipment profitability is estimated
        using average product revenue because sales are not yet linked to
        specific shipment batches. For stricter accounting, a future version
        should implement FIFO batch costing.
      </div>
    </div>
  )
}
