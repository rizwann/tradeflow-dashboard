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

function SaleMobileCard({
  sale,
  currentUserId,
  currentUserRole,
}: {
  sale: SaleTableRow
  currentUserId: string
  currentUserRole: UserRole
}) {
  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-[-0.02em]">{sale.productName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(sale.saleDate)}
          </p>
        </div>
        <Badge variant={sale.status === "voided" ? "secondary" : "outline"}>
          {formatSaleStatus(sale.status)}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Quantity
          </p>
          <p className="mt-2 text-sm font-semibold">{sale.quantity}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Revenue
          </p>
          <p className="mt-2 text-sm font-semibold">{formatBDT(sale.revenue)}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Payment
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatPaymentStatus(sale.paymentStatus)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Unit Price
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatBDT(sale.unitSellingPriceBdt)}
          </p>
        </div>
      </div>

      {sale.status === "voided" && sale.voidReason ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Reason: {sale.voidReason}
        </p>
      ) : null}

      <div className="mt-4">
        <SaleTableActions
          saleId={sale.id}
          saleStatus={sale.status}
          productName={sale.productName}
          soldBy={sale.soldBy}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      </div>
    </div>
  )
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
    cell: ({ row }) => formatDate(row.original.saleDate),
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
      mobileCardRenderer={(sale) => (
        <SaleMobileCard
          sale={sale}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}
    />
  )
}
