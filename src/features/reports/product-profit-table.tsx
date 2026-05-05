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

export function ProductProfitTable({ rows }: ProductProfitTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-background p-8 text-center">
        <h2 className="font-semibold">No sales data yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record sales to generate product profitability reports.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
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
            <TableRow key={row.productId}>
              <TableCell className="max-w-48 font-medium whitespace-normal">
                {row.productName}
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
  )
}
