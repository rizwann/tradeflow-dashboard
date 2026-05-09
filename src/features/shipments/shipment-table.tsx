"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"
import { Badge } from "@/components/ui/badge"
import { ShipmentTableActions } from "@/features/shipments/shipment-table-actions"
import type { UserRole } from "@/types/app"

export type ShipmentStatus =
  | "draft"
  | "sent"
  | "in_transit"
  | "received"
  | "lost_damaged"

export type ShipmentTableRow = {
  id: string
  shipmentCode: string
  method: "luggage" | "courier" | "cargo"
  status: ShipmentStatus
  shippingCost: number
  customsCost: number
  createdDate: string
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
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

function getShipmentStatusClassName(status: ShipmentStatus) {
  if (status === "draft") {
    return "border-slate-300/70 bg-slate-500/10 text-slate-700 dark:border-slate-500/25 dark:bg-slate-500/15 dark:text-slate-300"
  }

  if (status === "sent" || status === "in_transit") {
    return "border-sky-300/70 bg-sky-500/10 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300"
  }

  if (status === "received") {
    return "border-emerald-300/70 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300"
  }

  return "border-red-300/70 bg-red-500/10 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300"
}

function ShipmentMobileCard({
  shipment,
  currentUserRole,
}: {
  shipment: ShipmentTableRow
  currentUserRole: UserRole
}) {
  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/shipments/${shipment.id}`}
            className="block font-semibold tracking-[-0.02em] transition-colors hover:text-primary"
          >
            {shipment.shipmentCode}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            Created {formatDate(shipment.createdDate)}
          </p>
        </div>

        <Badge
          variant="outline"
          className={getShipmentStatusClassName(shipment.status)}
        >
          {formatLabel(shipment.status)}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Method
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatLabel(shipment.method)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Shipping
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatBDT(shipment.shippingCost)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Customs
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatBDT(shipment.customsCost)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ShipmentTableActions
          shipmentId={shipment.id}
          shipmentCode={shipment.shipmentCode}
          status={shipment.status}
          currentUserRole={currentUserRole}
        />
      </div>
    </div>
  )
}

function getColumns(currentUserRole: UserRole): ColumnDef<ShipmentTableRow>[] {
  return [
  {
    accessorKey: "shipmentCode",
    header: ({ column }) => (
      <SortableHeader column={column} title="Shipment code" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/shipments/${row.original.id}`}
        className="font-medium transition-colors hover:text-primary"
      >
        {row.original.shipmentCode}
      </Link>
    ),
  },
  {
    accessorKey: "method",
    header: ({ column }) => <SortableHeader column={column} title="Method" />,
    cell: ({ row }) => formatLabel(row.original.method),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => formatLabel(row.original.status),
  },
  {
    accessorKey: "shippingCost",
    header: ({ column }) => (
      <SortableHeader column={column} title="Shipping cost" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatBDT(row.original.shippingCost)}</div>
    ),
  },
  {
    accessorKey: "customsCost",
    header: ({ column }) => (
      <SortableHeader column={column} title="Customs cost" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatBDT(row.original.customsCost)}</div>
    ),
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => (
      <SortableHeader column={column} title="Created date" />
    ),
    cell: ({ row }) => formatDate(row.original.createdDate),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <ShipmentTableActions
        shipmentId={row.original.id}
        shipmentCode={row.original.shipmentCode}
        status={row.original.status}
        currentUserRole={currentUserRole}
      />
    ),
  },
]
}

type ShipmentTableProps = {
  shipments: ShipmentTableRow[]
  currentUserRole: UserRole
}

export function ShipmentTable({
  shipments,
  currentUserRole,
}: ShipmentTableProps) {
  return (
    <DataTable
      columns={getColumns(currentUserRole)}
      data={shipments}
      searchKey="shipmentCode"
      searchPlaceholder="Search shipments by code, method, or status..."
      emptyTitle="No shipments yet"
      emptyDescription="Create shipments to move inventory from Germany to Bangladesh."
      mobileCardRenderer={(shipment) => (
        <ShipmentMobileCard
          shipment={shipment}
          currentUserRole={currentUserRole}
        />
      )}
    />
  )
}
