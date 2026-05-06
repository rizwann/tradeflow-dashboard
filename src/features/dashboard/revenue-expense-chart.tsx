"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
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
  backgroundColor: "var(--popover)",
  borderColor: "var(--border)",
  color: "var(--popover-foreground)",
  borderRadius: "14px",
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  if (data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Monthly performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Revenue, expenses, and profit trends appear here as transactions are
            recorded.
          </p>
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
    <Card className="border-border/60 bg-card/78">
      <CardHeader className="pb-2">
        <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Performance Overview
        </p>
        <CardTitle>Monthly performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revenue and BDT expenses shown as bars, with FIFO-backed gross and
          net profit as trend lines.
        </p>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="min-w-0 overflow-x-auto pb-2">
          <div className="min-w-[40rem] sm:min-w-0">
            <div className="h-[320px] min-h-[320px] w-full min-w-0 sm:h-[384px] sm:min-h-[384px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid
                    stroke="var(--chart-grid)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={chartAxisStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(value: number) => formatBDT(value)}
                    tick={chartAxisStyle}
                    axisLine={false}
                    tickLine={false}
                    width={80}
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
                  <Legend
                    formatter={getSeriesLabel}
                    wrapperStyle={{ paddingTop: 16 }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="revenue"
                    fill="var(--chart-1)"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="expenses"
                    fill="var(--chart-4)"
                    radius={[10, 10, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="grossProfit"
                    name="grossProfit"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "var(--chart-2)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netProfit"
                    name="netProfit"
                    stroke="var(--chart-5)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "var(--chart-5)" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
