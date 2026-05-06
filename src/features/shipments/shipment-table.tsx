"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"
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
    />
  )
}
