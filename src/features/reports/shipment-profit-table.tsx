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
      <div className="rounded-xl border bg-background p-8 text-center">
        <h2 className="font-semibold">No shipment profitability yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create shipments and record sales to generate shipment profitability.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shipment</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Est. revenue</TableHead>
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
