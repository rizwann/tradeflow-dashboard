import { ErrorState } from "@/components/shared/error-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
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
      "product_id, quantity, unit_selling_price_bdt, discount, sale_date, products(name, purchase_price_bdt)",
    )
    .returns<SaleRow[]>()

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, currency, date")
    .returns<ExpenseRow[]>()

  if (salesError || expensesError) {
    return <ErrorState title="Could not load reports" />
  }

  const productMap = new Map<
    string,
    {
      productId: string
      productName: string
      purchasePriceBDT: number
      quantitySold: number
      revenue: number
    }
  >()

  for (const sale of sales ?? []) {
    const revenue =
      sale.quantity * sale.unit_selling_price_bdt - Number(sale.discount ?? 0)

    const existing = productMap.get(sale.product_id) ?? {
      productId: sale.product_id,
      productName: sale.products?.name ?? "Unknown product",
      purchasePriceBDT: Number(sale.products?.purchase_price_bdt ?? 0),
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

  const totalProductCost = productProfitRows.reduce(
    (sum, row) => sum + row.productCost,
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
      <PageHeader
        title="Reports"
        description="Analyze profitability, sales performance, and monthly business trends."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatBDT(totalRevenue)}
          description="From recorded sales"
        />
        <MetricCard
          title="Product Cost"
          value={formatBDT(totalProductCost)}
          description="Purchase cost estimate"
        />
        <MetricCard
          title="Gross Profit"
          value={formatBDT(totalGrossProfit)}
          description="Revenue minus product cost"
        />
        <MetricCard
          title="BDT Expenses"
          value={formatBDT(totalExpenses)}
          description="Operational costs"
        />
      </div>

      <MonthlyReportChart data={monthlyData} />

      <div>
        <h2 className="mb-3 text-xl font-semibold">Profit by product</h2>
        <ProductProfitTable rows={productProfitRows} />
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        MVP note: product profit currently uses purchase price as estimated
        cost. A later version should allocate shipping, customs, and other costs
        into landed cost per product.
      </div>
    </div>
  )
}
