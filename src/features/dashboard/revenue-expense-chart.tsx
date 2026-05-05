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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Monthly performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revenue and BDT expenses shown as bars, with FIFO-backed gross and
          net profit as trend lines.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value: number) => formatBDT(value)} />
              <Tooltip
                formatter={(value, name) => [
                  formatBDT(Number(value ?? 0)),
                  getSeriesLabel(String(name)),
                ]}
              />
              <Legend formatter={getSeriesLabel} />
              <Bar
                dataKey="revenue"
                name="revenue"
                fill="hsl(var(--chart-1, 215 90% 55%))"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="expenses"
                fill="hsl(var(--chart-4, 12 76% 61%))"
                radius={[6, 6, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="grossProfit"
                name="grossProfit"
                stroke="hsl(var(--chart-2, 160 70% 38%))"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="netProfit"
                name="netProfit"
                stroke="hsl(var(--chart-5, 262 75% 55%))"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
