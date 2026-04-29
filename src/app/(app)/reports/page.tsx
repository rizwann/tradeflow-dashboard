import { MetricCard } from "@/components/shared/metric-card"
import { createClient } from "@/lib/supabase/server"
import { ProductProfitTable } from "@/features/reports/product-profit-table"
import { MonthlyReportChart } from "@/features/reports/monthly-report-chart"
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

  if (salesError || expensesError || shipmentItemsError) {
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

      <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        Business note: landed cost currently uses average allocated shipment and
        customs cost per product. This is suitable for operational reporting.
        For stricter accounting, later we can track sale-to-shipment batch cost
        using FIFO.
      </div>
    </div>
  )
}
