"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CustomerLeaderboardRow } from "@/features/analytics/customer-delivery-analytics"

type CustomerPerformanceTableProps = {
  rows: CustomerLeaderboardRow[]
  hasProfitData: boolean
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatDate(value: string | null) {
  if (!value) return "No orders yet"

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate)
}

export function CustomerPerformanceTable({
  rows,
  hasProfitData,
}: CustomerPerformanceTableProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((customer, index) => (
          <div
            key={customer.customerId}
            className="surface-panel-subtle rounded-[1.45rem] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold tracking-[-0.02em]">
                  {customer.customerName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last order {formatDate(customer.lastOrderDate)}
                </p>
              </div>
              <Badge variant="outline">#{index + 1}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Orders
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {customer.ordersCount.toLocaleString("en-US")}
                </p>
              </div>
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Avg Order
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {formatBDT(customer.averageOrderValue)}
                </p>
              </div>
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Revenue
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {formatBDT(customer.revenue)}
                </p>
              </div>
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Profit
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {hasProfitData ? formatBDT(customer.profit) : "Pending"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table className="min-w-[52rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Avg Order</TableHead>
              <TableHead>Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((customer) => (
              <TableRow key={customer.customerId}>
                <TableCell className="font-medium">
                  {customer.customerName}
                </TableCell>
                <TableCell className="text-right">
                  {customer.ordersCount.toLocaleString("en-US")}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatBDT(customer.revenue)}
                </TableCell>
                <TableCell className="text-right">
                  {hasProfitData ? formatBDT(customer.profit) : "Pending"}
                </TableCell>
                <TableCell className="text-right">
                  {formatBDT(customer.averageOrderValue)}
                </TableCell>
                <TableCell>{formatDate(customer.lastOrderDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
