"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type ChartData = {
  month: string
  revenue: number
  expenses: number
  profit: number
}

type RevenueExpenseChartProps = {
  data: ChartData[]
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  return (
    <div className="h-80 rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="font-semibold">Monthly performance</h2>
        <p className="text-sm text-muted-foreground">
          Revenue, expenses, and profit by month.
        </p>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" />
          <Bar dataKey="expenses" />
          <Bar dataKey="profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
