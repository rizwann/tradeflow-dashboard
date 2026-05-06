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
    <div className="rounded-[1.75rem] border border-border/60 bg-card/78 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
      <div className="mb-4 space-y-1">
        <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Executive Trendline
        </p>
        <h2 className="font-semibold tracking-tight">
          Monthly revenue vs expenses
        </h2>
        <p className="text-sm text-muted-foreground">
          BDT-only comparison for clean financial reporting.
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="h-64 min-w-[36rem] sm:h-72 sm:min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                stroke="var(--chart-grid)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="month" tick={chartAxisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} width={72} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                cursor={{ fill: "color-mix(in oklab, var(--accent) 26%, transparent)" }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--chart-4)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
