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

type MonthlyReportRow = {
  month: string
  revenue: number
  expenses: number
}

type MonthlyReportChartProps = {
  data: MonthlyReportRow[]
}

export function MonthlyReportChart({ data }: MonthlyReportChartProps) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="font-semibold">Monthly revenue vs expenses</h2>
        <p className="text-sm text-muted-foreground">
          BDT-only comparison for clean financial reporting.
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="h-64 min-w-[36rem] sm:h-72 sm:min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" />
              <Bar dataKey="expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
