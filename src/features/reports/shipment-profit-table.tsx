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
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.shipmentId}
            className="surface-panel-subtle rounded-[1.45rem] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-semibold tracking-[-0.02em]">
                {row.shipmentCode}
              </p>
              <p className="text-sm font-semibold">{row.margin.toFixed(1)}%</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Revenue
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {formatBDT(row.estimatedRevenue)}
                </p>
              </div>
              <div className="surface-tile px-3 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Landed Cost
                </p>
                <p className="mt-2 text-sm font-medium">
                  {formatBDT(row.landedCost)}
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
                  Qty
                </p>
                <p className="mt-2 text-sm font-medium">{row.totalQuantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="surface-panel overflow-hidden rounded-[1.75rem] bg-card/80">
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
      </div>
    </>
  )
}
