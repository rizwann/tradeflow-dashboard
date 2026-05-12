"use client"

import { EmptyState } from "@/components/shared/empty-state"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type ChartData = {
  month: string
  revenue: number
  expenses: number
  grossProfit: number
  netProfit: number
}

type RevenueExpenseChartProps = {
  data: ChartData[]
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatAxisBDT(value: number) {
  const absoluteValue = Math.abs(value)

  if (absoluteValue >= 1000) {
    return `৳${new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)}`
  }

  return `৳${Math.round(value)}`
}

function getSeriesLabel(name: string) {
  if (name === "grossProfit") return "Gross Profit"
  if (name === "netProfit") return "Net Profit"
  if (name === "expenses") return "Expenses"

  return "Revenue"
}

const chartAxisStyle = {
  fill: "var(--chart-axis)",
  fontSize: 12,
}

const chartTooltipStyle = {
  backgroundColor: "color-mix(in oklab, var(--popover) 94%, transparent)",
  borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
  color: "var(--popover-foreground)",
  borderRadius: "18px",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.18)",
  backdropFilter: "blur(16px)",
}

const legendItems = [
  { label: "Revenue", color: "var(--chart-1)" },
  { label: "Expenses", color: "var(--chart-4)" },
  { label: "Gross Profit", color: "var(--chart-2)" },
  { label: "Net Profit", color: "var(--chart-5)" },
]

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <p className="eyebrow-label">Performance Overview</p>
          <CardTitle>Monthly performance</CardTitle>
          <CardDescription>
            Revenue, expenses, and profit trends appear here as transactions are
            recorded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No monthly activity yet"
            description="Create sales, FIFO consumptions, and BDT expenses to populate the trend chart."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full min-w-0 border-border/60 bg-card/78">
      <CardHeader className="pb-2">
        <p className="eyebrow-label">Performance Overview</p>
        <CardTitle>Monthly performance</CardTitle>
        <CardDescription>
          Revenue and BDT expenses shown as bars, with FIFO-backed gross and
          net profit as trend lines.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden">
        <div className="h-[300px] w-full min-w-0 overflow-hidden sm:h-[384px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid
                stroke="var(--chart-grid)"
                strokeDasharray="3 5"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={chartAxisStyle}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(value: number) => formatAxisBDT(value)}
                tick={chartAxisStyle}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                cursor={{
                  fill: "color-mix(in oklab, var(--accent) 26%, transparent)",
                }}
                formatter={(value, name) => [
                  formatBDT(Number(value ?? 0)),
                  getSeriesLabel(String(name)),
                ]}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              />
              <Bar
                dataKey="revenue"
                name="revenue"
                fill="var(--chart-1)"
                barSize={24}
                radius={[10, 10, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="expenses"
                fill="var(--chart-4)"
                barSize={24}
                radius={[10, 10, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="grossProfit"
                name="grossProfit"
                stroke="var(--chart-2)"
                strokeWidth={3}
                dot={{ r: 3, fill: "var(--chart-2)" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="netProfit"
                name="netProfit"
                stroke="var(--chart-5)"
                strokeWidth={3}
                dot={{ r: 3, fill: "var(--chart-5)" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex min-w-0 flex-wrap gap-x-4 gap-y-2">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
