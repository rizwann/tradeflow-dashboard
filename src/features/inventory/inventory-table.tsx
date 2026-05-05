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
    />
  )
}
