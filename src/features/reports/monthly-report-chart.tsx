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

export function MonthlyReportChart({ data }: MonthlyReportChartProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/92 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.05)]">
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
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={chartAxisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} width={72} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                cursor={{ fill: "color-mix(in oklab, var(--accent) 26%, transparent)" }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
