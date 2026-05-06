"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { SaleTableActions } from "./sale-table-actions"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"
import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/types/app"

export type SaleTableRow = {
  id: string
  productName: string
  quantity: number
  unitSellingPriceBdt: number
  discount: number
  revenue: number
  paymentStatus: "paid" | "unpaid" | "partial"
  saleDate: string
  soldBy: string
  status: "active" | "voided"
  voidedAt: string | null
  voidReason: string | null
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatPaymentStatus(status: SaleTableRow["paymentStatus"]) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatSaleStatus(status: SaleTableRow["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getColumns(
  currentUserId: string,
  currentUserRole: UserRole,
): ColumnDef<SaleTableRow>[] {
  return [
  {
    accessorKey: "productName",
    header: ({ column }) => <SortableHeader column={column} title="Product" />,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.productName}</div>
        {row.original.status === "voided" && row.original.voidReason ? (
          <div className="text-xs text-muted-foreground">
            Reason: {row.original.voidReason}
          </div>
        ) : null}
      </div>
    ),
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
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={row.original.status === "voided" ? "secondary" : "outline"}>
        {formatSaleStatus(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "saleDate",
    header: ({ column }) => <SortableHeader column={column} title="Sale date" />,
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <SaleTableActions
        saleId={row.original.id}
        saleStatus={row.original.status}
        productName={row.original.productName}
        soldBy={row.original.soldBy}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    ),
  },
]
}

type SaleTableProps = {
  sales: SaleTableRow[]
  currentUserId: string
  currentUserRole: UserRole
}

export function SaleTable({
  sales,
  currentUserId,
  currentUserRole,
}: SaleTableProps) {
  return (
    <DataTable
      columns={getColumns(currentUserId, currentUserRole)}
      data={sales}
      searchKey="productName"
      searchPlaceholder="Search sales by product or payment status..."
      emptyTitle="No sales yet"
      emptyDescription="Record your first sale after receiving inventory in Bangladesh."
    />
  )
}
