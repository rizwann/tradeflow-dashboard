import { MetricCard } from "@/components/shared/metric-card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of inventory, revenue, profit, and operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Revenue" value="৳0" />
        <MetricCard title="Total Profit" value="৳0" />
        <MetricCard title="Products in Germany" value="0" />
        <MetricCard title="Products in Bangladesh" value="0" />
      </div>
    </div>
  )
}
