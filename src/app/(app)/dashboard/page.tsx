import { MetricCard } from "@/components/shared/metric-card"
import { createClient } from "@/lib/supabase/server"
import { RevenueExpenseChart } from "@/features/dashboard/revenue-expense-chart"
import { calculateNetProfit, calculateProfitMargin } from "@/lib/calculations"

type SaleRow = {
  quantity: number
  unit_selling_price_bdt: number
  discount: number
  sale_date: string
}

type ExpenseRow = {
  amount: number
  currency: string
  date: string
}

type InventoryRow = {
  location: "germany" | "in_transit" | "bangladesh"
  quantity: number
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function getMonthKey(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    year: "2-digit",
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select("quantity, unit_selling_price_bdt, discount, sale_date")
    .returns<SaleRow[]>()

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, currency, date")
    .returns<ExpenseRow[]>()

  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select("location, quantity")
    .returns<InventoryRow[]>()

  if (salesError || expensesError || inventoryError) {
    return (
      <div className="rounded-xl border bg-background p-6">
        <h1 className="text-xl font-semibold">Could not load dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh the page or try again later.
        </p>
      </div>
    )
  }

  const totalRevenue = (sales ?? []).reduce((sum, sale) => {
    return (
      sum +
      sale.quantity * sale.unit_selling_price_bdt -
      Number(sale.discount ?? 0)
    )
  }, 0)

  const totalExpenses = (expenses ?? []).reduce((sum, expense) => {
    if (expense.currency !== "BDT") return sum
    return sum + expense.amount
  }, 0)

  /**
   * MVP note:
   * We are using revenue - BDT expenses for dashboard profit.
   * Later, reports should subtract product landed cost too.
   */
  const totalProfit = calculateNetProfit({
    revenue: totalRevenue,
    productCosts: 0,
    expenses: totalExpenses,
  })

  const profitMargin = calculateProfitMargin(totalProfit, totalRevenue)

  const germanyStock =
    inventory
      ?.filter((item) => item.location === "germany")
      .reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const inTransitStock =
    inventory
      ?.filter((item) => item.location === "in_transit")
      .reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const bangladeshStock =
    inventory
      ?.filter((item) => item.location === "bangladesh")
      .reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const monthlyMap = new Map<
    string,
    {
      month: string
      revenue: number
      expenses: number
      profit: number
    }
  >()

  for (const sale of sales ?? []) {
    const month = getMonthKey(sale.sale_date)
    const existing = monthlyMap.get(month) ?? {
      month,
      revenue: 0,
      expenses: 0,
      profit: 0,
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
      profit: 0,
    }

    existing.expenses += expense.amount

    monthlyMap.set(month, existing)
  }

  const chartData = Array.from(monthlyMap.values()).map((item) => ({
    ...item,
    profit: item.revenue - item.expenses,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of revenue, expenses, profit, and inventory movement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatBDT(totalRevenue)}
          description="From recorded sales"
        />
        <MetricCard
          title="Total Expenses"
          value={formatBDT(totalExpenses)}
          description="BDT expenses only"
        />
        <MetricCard
          title="Estimated Profit"
          value={formatBDT(totalProfit)}
          description="Revenue minus BDT expenses"
        />
        <MetricCard
          title="Profit Margin"
          value={formatPercent(profitMargin)}
          description="Estimated margin"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Germany Stock"
          value={String(germanyStock)}
          description="Available before shipment"
        />
        <MetricCard
          title="In Transit"
          value={String(inTransitStock)}
          description="Currently moving"
        />
        <MetricCard
          title="Bangladesh Stock"
          value={String(bangladeshStock)}
          description="Available for sale"
        />
      </div>

      <RevenueExpenseChart data={chartData} />
    </div>
  )
}
