"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"
import { StatusBadge } from "@/components/shared/status-badge"

export type InventoryRow = {
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

function InventoryMobileCard({ row }: { row: InventoryRow }) {
  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-[-0.02em]">{row.productName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{row.sku}</p>
        </div>
        <StatusBadge status={getStockStatus(row.total)} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Germany
          </p>
          <p className="mt-2 text-sm font-semibold">{row.germany}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            In Transit
          </p>
          <p className="mt-2 text-sm font-semibold">{row.inTransit}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Bangladesh
          </p>
          <p className="mt-2 text-sm font-semibold">{row.bangladesh}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Total Stock
          </p>
          <p className="mt-2 text-sm font-semibold">{row.total}</p>
        </div>
      </div>
    </div>
  )
}

const columns: ColumnDef<InventoryRow>[] = [
  {
    accessorKey: "productName",
    header: ({ column }) => <SortableHeader column={column} title="Product" />,
    cell: ({ row }) => <div className="font-medium">{row.original.productName}</div>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "germany",
    header: ({ column }) => (
      <SortableHeader column={column} title="Germany" align="right" />
    ),
    cell: ({ row }) => <div className="text-right">{row.original.germany}</div>,
  },
  {
    accessorKey: "inTransit",
    header: ({ column }) => (
      <SortableHeader column={column} title="In transit" align="right" />
    ),
    cell: ({ row }) => <div className="text-right">{row.original.inTransit}</div>,
  },
  {
    accessorKey: "bangladesh",
    header: ({ column }) => (
      <SortableHeader column={column} title="Bangladesh" align="right" />
    ),
    cell: ({ row }) => <div className="text-right">{row.original.bangladesh}</div>,
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <SortableHeader column={column} title="Total" align="right" />
    ),
    cell: ({ row }) => <div className="text-right font-medium">{row.original.total}</div>,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={getStockStatus(row.original.total)} />,
  },
]

type InventoryTableProps = {
  rows: InventoryRow[]
}

export function InventoryTable({ rows }: InventoryTableProps) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKey="productName"
      searchPlaceholder="Search inventory by product name or SKU..."
      emptyTitle="No inventory yet"
      emptyDescription="Record purchases first to add Germany-side stock."
      mobileCardRenderer={(row) => <InventoryMobileCard row={row} />}
    />
  )
}
