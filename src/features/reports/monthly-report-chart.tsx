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
  backgroundColor: "color-mix(in oklab, var(--popover) 94%, transparent)",
  borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
  color: "var(--popover-foreground)",
  borderRadius: "18px",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.16)",
  backdropFilter: "blur(16px)",
}

function formatAxisValue(value: number) {
  const absoluteValue = Math.abs(value)

  if (absoluteValue >= 1000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }

  return Math.round(value).toString()
}

export function MonthlyReportChart({ data }: MonthlyReportChartProps) {
  return (
    <div className="surface-panel min-w-0 overflow-hidden rounded-[1.75rem] bg-card/78 p-5 sm:p-6">
      <div className="mb-4 space-y-1">
        <p className="eyebrow-label">
          Executive Trendline
        </p>
        <h2 className="font-semibold tracking-[-0.02em]">
          Monthly revenue vs expenses
        </h2>
        <p className="text-sm text-muted-foreground/95">
          BDT-only comparison for clean financial reporting.
        </p>
      </div>

      <div className="h-[300px] w-full min-w-0 overflow-hidden sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
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
              tickFormatter={formatAxisValue}
              tick={chartAxisStyle}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              cursor={{
                fill: "color-mix(in oklab, var(--accent) 26%, transparent)",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            />
            <Bar
              dataKey="revenue"
              fill="var(--chart-1)"
              barSize={24}
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="var(--chart-4)"
              barSize={24}
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
