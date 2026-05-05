"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"

export type PurchaseTableRow = {
  id: string
  productName: string
  quantity: number
  unitCostEur: number
  exchangeRate: number
  totalCostBdt: number
  purchaseDate: string
}

function formatEUR(value: number) {
  return `€${value.toFixed(2)}`
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

const columns: ColumnDef<PurchaseTableRow>[] = [
  {
    accessorKey: "productName",
    header: ({ column }) => <SortableHeader column={column} title="Product" />,
    cell: ({ row }) => <div className="font-medium">{row.original.productName}</div>,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <SortableHeader column={column} title="Quantity" align="right" />
    ),
    cell: ({ row }) => <div className="text-right">{row.original.quantity}</div>,
  },
  {
    accessorKey: "unitCostEur",
    header: ({ column }) => (
      <SortableHeader column={column} title="Unit cost EUR" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatEUR(row.original.unitCostEur)}</div>
    ),
  },
  {
    accessorKey: "exchangeRate",
    header: ({ column }) => (
      <SortableHeader column={column} title="Exchange rate" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.exchangeRate.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "totalCostBdt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Total cost BDT" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatBDT(row.original.totalCostBdt)}
      </div>
    ),
  },
  {
    accessorKey: "purchaseDate",
    header: ({ column }) => (
      <SortableHeader column={column} title="Purchase date" />
    ),
    cell: ({ row }) => formatDate(row.original.purchaseDate),
  },
]

type PurchaseTableProps = {
  purchases: PurchaseTableRow[]
}

export function PurchaseTable({ purchases }: PurchaseTableProps) {
  return (
    <DataTable
      columns={columns}
      data={purchases}
      searchKey="productName"
      searchPlaceholder="Search purchases by product name..."
      emptyTitle="No purchases yet"
      emptyDescription="Record purchases to add Germany-side inventory."
    />
  )
}
