import Link from "next/link"

import { EmptyState } from "@/components/shared/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ProductProfitRow = {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
  landedCostTotal: number
  grossProfit: number
  margin: number
}

type ProductProfitTableProps = {
  rows: ProductProfitRow[]
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function getProductLinkClassName() {
  return "min-w-0 font-semibold tracking-[-0.02em] transition-colors hover:text-primary hover:underline underline-offset-4"
}

export function ProductProfitTable({ rows }: ProductProfitTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No sales data yet"
        description="Record sales to generate product profitability reports."
      />
    )
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.productId}
            className="surface-panel-subtle rounded-[1.45rem] p-4 transition-colors hover:bg-muted/20"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/products/${row.productId}`}
                aria-label={`View product details for ${row.productName}`}
                className={getProductLinkClassName()}
              >
                {row.productName}
              </Link>
              <p className="text-sm font-semibold">{row.margin.toFixed(1)}%</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Revenue
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {formatBDT(row.revenue)}
                </p>
              </div>
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Landed Cost
                </p>
                <p className="mt-2 text-sm font-medium">
                  {formatBDT(row.landedCostTotal)}
                </p>
              </div>
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Gross Profit
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {formatBDT(row.grossProfit)}
                </p>
              </div>
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Qty Sold
                </p>
                <p className="mt-2 text-sm font-medium">{row.quantitySold}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="surface-panel overflow-hidden rounded-[1.75rem] bg-card/80">
          <Table className="min-w-[42rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Landed cost</TableHead>
                <TableHead className="text-right">Gross profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.productId} className="hover:bg-muted/20">
                  <TableCell className="max-w-56 whitespace-normal">
                    <Link
                      href={`/products/${row.productId}`}
                      aria-label={`View product details for ${row.productName}`}
                      className="font-medium transition-colors hover:text-primary hover:underline underline-offset-4"
                    >
                      {row.productName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{row.quantitySold}</TableCell>
                  <TableCell className="text-right">
                    {formatBDT(row.revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatBDT(row.landedCostTotal)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatBDT(row.grossProfit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.margin.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
