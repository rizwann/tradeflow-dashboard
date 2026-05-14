"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { SortableHeader } from "@/components/shared/sortable-header"
import { DeliveryTableActions } from "./delivery-table-actions"
import { DeliveryStatusBadge } from "./delivery-status-badge"
import type { DeliveryCostPaidBy, DeliveryStatus } from "./delivery-schema"
import type { UserRole } from "@/types/app"

export type DeliveryTableRow = {
  id: string
  saleId: string
  saleStatus: "active" | "voided"
  customerId: string | null
  customerName: string
  customerPhone: string | null
  productName: string
  saleDate: string
  status: DeliveryStatus
  deliveryMethod: string | null
  trackingNumber: string | null
  deliveryCost: number
  deliveryCostPaidBy: DeliveryCostPaidBy
  shippedAt: string | null
  deliveredAt: string | null
  notes: string | null
  soldBy: string
  customerCreatedBy: string | null
  deliveryCreatedBy: string | null
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatDate(value: string | null) {
  if (!value) return "Not available"

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

function canManageRow(
  row: DeliveryTableRow,
  currentUserId: string,
  currentUserRole: UserRole,
) {
  return (
    currentUserRole === "admin" ||
    row.soldBy === currentUserId ||
    row.customerCreatedBy === currentUserId ||
    row.deliveryCreatedBy === currentUserId
  )
}

function DeliveryMobileCard({
  row,
  currentUserId,
  currentUserRole,
}: {
  row: DeliveryTableRow
  currentUserId: string
  currentUserRole: UserRole
}) {
  const canManage = canManageRow(row, currentUserId, currentUserRole)

  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-[-0.02em]">{row.customerName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{row.productName}</p>
        </div>
        <DeliveryStatusBadge status={row.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Cost
          </p>
          <p className="mt-2 text-sm font-semibold">{formatBDT(row.deliveryCost)}</p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">
            {row.deliveryCostPaidBy}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Method
          </p>
          <p className="mt-2 text-sm font-medium">
            {row.deliveryMethod ?? "Not set"}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Shipped
          </p>
          <p className="mt-2 text-sm font-medium">{formatDate(row.shippedAt)}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Delivered
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatDate(row.deliveredAt)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <DeliveryTableActions
          saleId={row.saleId}
          saleStatus={row.saleStatus}
          customerId={row.customerId}
          customerName={row.customerName}
          canManage={canManage}
          delivery={{
            id: row.id,
            status: row.status,
            delivery_method: row.deliveryMethod,
            tracking_number: row.trackingNumber,
            delivery_cost: row.deliveryCost,
            delivery_cost_paid_by: row.deliveryCostPaidBy,
            shipped_at: row.shippedAt,
            delivered_at: row.deliveredAt,
            notes: row.notes,
          }}
          triggerLabel="Edit delivery"
        />
      </div>
    </div>
  )
}

function getColumns(
  currentUserId: string,
  currentUserRole: UserRole,
): ColumnDef<DeliveryTableRow>[] {
  return [
    {
      accessorKey: "customerName",
      header: ({ column }) => <SortableHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          {row.original.customerPhone ? (
            <p className="text-xs text-muted-foreground">
              {row.original.customerPhone}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "productName",
      header: ({ column }) => <SortableHeader column={column} title="Product" />,
    },
    {
      accessorKey: "saleDate",
      header: ({ column }) => <SortableHeader column={column} title="Sale date" />,
      cell: ({ row }) => formatDate(row.original.saleDate),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => <DeliveryStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "deliveryMethod",
      header: "Delivery method",
      cell: ({ row }) => row.original.deliveryMethod ?? "—",
    },
    {
      accessorKey: "deliveryCost",
      header: ({ column }) => (
        <SortableHeader column={column} title="Delivery cost" align="right" />
      ),
      cell: ({ row }) => (
        <div className="text-right">{formatBDT(row.original.deliveryCost)}</div>
      ),
    },
    {
      accessorKey: "deliveryCostPaidBy",
      header: "Paid by",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.deliveryCostPaidBy}</span>
      ),
    },
    {
      accessorKey: "shippedAt",
      header: "Shipped at",
      cell: ({ row }) => formatDate(row.original.shippedAt),
    },
    {
      accessorKey: "deliveredAt",
      header: "Delivered at",
      cell: ({ row }) => formatDate(row.original.deliveredAt),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <DeliveryTableActions
          saleId={row.original.saleId}
          saleStatus={row.original.saleStatus}
          customerId={row.original.customerId}
          customerName={row.original.customerName}
          canManage={canManageRow(row.original, currentUserId, currentUserRole)}
          delivery={{
            id: row.original.id,
            status: row.original.status,
            delivery_method: row.original.deliveryMethod,
            tracking_number: row.original.trackingNumber,
            delivery_cost: row.original.deliveryCost,
            delivery_cost_paid_by: row.original.deliveryCostPaidBy,
            shipped_at: row.original.shippedAt,
            delivered_at: row.original.deliveredAt,
            notes: row.original.notes,
          }}
          triggerLabel="Edit delivery"
        />
      ),
    },
  ]
}

type DeliveryTableProps = {
  deliveries: DeliveryTableRow[]
  currentUserId: string
  currentUserRole: UserRole
}

export function DeliveryTable({
  deliveries,
  currentUserId,
  currentUserRole,
}: DeliveryTableProps) {
  if (deliveries.length === 0) {
    return (
      <EmptyState
        title="No deliveries yet"
        description="Add delivery tracking from the sales table once orders need fulfilment."
      />
    )
  }

  return (
    <DataTable
      columns={getColumns(currentUserId, currentUserRole)}
      data={deliveries}
      searchKey="customerName"
      searchPlaceholder="Search deliveries by customer, product, method, or status..."
      emptyTitle="No deliveries found"
      emptyDescription="Try adjusting your search."
      mobileCardRenderer={(row) => (
        <DeliveryMobileCard
          row={row}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}
    />
  )
}
