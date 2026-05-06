import { EmptyState } from "@/components/shared/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ShipmentProfitRow = {
  shipmentId: string
  shipmentCode: string
  totalQuantity: number
  estimatedRevenue: number
  landedCost: number
  grossProfit: number
  margin: number
}

type ShipmentProfitTableProps = {
  rows: ShipmentProfitRow[]
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

export function ShipmentProfitTable({ rows }: ShipmentProfitTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No shipment profitability yet"
        description="Create shipments and record sales to generate shipment profitability."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <Table className="min-w-2xl">
        <TableHeader>
          <TableRow>
            <TableHead>Shipment</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Landed cost</TableHead>
            <TableHead className="text-right">Gross profit</TableHead>
            <TableHead className="text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.shipmentId}>
              <TableCell className="font-medium">{row.shipmentCode}</TableCell>
              <TableCell className="text-right">{row.totalQuantity}</TableCell>
              <TableCell className="text-right">
                {formatBDT(row.estimatedRevenue)}
              </TableCell>
              <TableCell className="text-right">
                {formatBDT(row.landedCost)}
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
