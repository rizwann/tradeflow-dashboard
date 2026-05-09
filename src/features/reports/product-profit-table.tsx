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
            <TableRow key={row.productId}>
              <TableCell className="max-w-56 whitespace-normal">
                <div className="font-medium">{row.productName}</div>
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
