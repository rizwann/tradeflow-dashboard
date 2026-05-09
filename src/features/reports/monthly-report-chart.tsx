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

export function MonthlyReportChart({ data }: MonthlyReportChartProps) {
  return (
    <div className="surface-panel rounded-[1.75rem] bg-card/78 p-5 sm:p-6">
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

      <div className="min-w-0 overflow-x-auto pb-2">
        <div className="min-w-[36rem] sm:min-w-0">
          <div className="h-[320px] min-h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 2 }}>
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
                />
                <YAxis
                  tick={chartAxisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={72}
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
      </div>
    </div>
  )
}
