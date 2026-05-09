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

function PurchaseMobileCard({ purchase }: { purchase: PurchaseTableRow }) {
  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-[-0.02em]">
            {purchase.productName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(purchase.purchaseDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Quantity
          </p>
          <p className="mt-1 text-sm font-semibold">{purchase.quantity}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Unit Cost EUR
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatEUR(purchase.unitCostEur)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Total Cost BDT
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatBDT(purchase.totalCostBdt)}
          </p>
        </div>
      </div>
    </div>
  )
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
      mobileCardRenderer={(purchase) => (
        <PurchaseMobileCard purchase={purchase} />
      )}
    />
  )
}
