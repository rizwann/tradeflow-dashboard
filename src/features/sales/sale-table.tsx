"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"

export type SaleTableRow = {
  id: string
  productName: string
  quantity: number
  unitSellingPriceBdt: number
  discount: number
  revenue: number
  paymentStatus: "paid" | "unpaid" | "partial"
  saleDate: string
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatPaymentStatus(status: SaleTableRow["paymentStatus"]) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const columns: ColumnDef<SaleTableRow>[] = [
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
    accessorKey: "unitSellingPriceBdt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Unit price BDT" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {formatBDT(row.original.unitSellingPriceBdt)}
      </div>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => <div className="text-right">{formatBDT(row.original.discount)}</div>,
  },
  {
    accessorKey: "revenue",
    header: ({ column }) => (
      <SortableHeader column={column} title="Revenue" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">{formatBDT(row.original.revenue)}</div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment status",
    cell: ({ row }) => formatPaymentStatus(row.original.paymentStatus),
  },
  {
    accessorKey: "saleDate",
    header: ({ column }) => <SortableHeader column={column} title="Sale date" />,
  },
]

type SaleTableProps = {
  sales: SaleTableRow[]
}

export function SaleTable({ sales }: SaleTableProps) {
  return (
    <DataTable
      columns={columns}
      data={sales}
      searchKey="productName"
      searchPlaceholder="Search sales by product or payment status..."
      emptyTitle="No sales yet"
      emptyDescription="Record your first sale after receiving inventory in Bangladesh."
    />
  )
}
