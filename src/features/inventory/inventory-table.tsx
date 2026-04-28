import { StatusBadge } from "@/components/shared/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type InventoryRow = {
  productId: string
  productName: string
  sku: string
  germany: number
  inTransit: number
  bangladesh: number
  total: number
}

function getStockStatus(total: number) {
  if (total === 0) return "out"
  if (total <= 5) return "low"
  return "healthy"
}

type InventoryTableProps = {
  rows: InventoryRow[]
}

export function InventoryTable({ rows }: InventoryTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-background p-8 text-center">
        <h2 className="font-semibold">No inventory yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record purchases first to add Germany-side stock.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Germany</TableHead>
            <TableHead className="text-right">In transit</TableHead>
            <TableHead className="text-right">Bangladesh</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.productId}>
              <TableCell className="font-medium">{row.productName}</TableCell>
              <TableCell>{row.sku}</TableCell>
              <TableCell className="text-right">{row.germany}</TableCell>
              <TableCell className="text-right">{row.inTransit}</TableCell>
              <TableCell className="text-right">{row.bangladesh}</TableCell>
              <TableCell className="text-right font-medium">
                {row.total}
              </TableCell>
              <TableCell>
                <StatusBadge status={getStockStatus(row.total)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
