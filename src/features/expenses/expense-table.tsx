"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"

export type ExpenseTableRow = {
  id: string
  type: "shipping" | "customs" | "packaging" | "marketing" | "delivery" | "other"
  amount: number
  currency: string
  relatedShipment: string
  date: string
  notes: string
}

function formatAmount(amount: number, currency: string) {
  if (currency === "EUR") {
    return `€${amount.toFixed(2)}`
  }

  return `৳${Math.round(amount).toLocaleString("en-US")}`
}

function formatType(type: ExpenseTableRow["type"]) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const columns: ColumnDef<ExpenseTableRow>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} title="Type" />,
    cell: ({ row }) => <div className="font-medium">{formatType(row.original.type)}</div>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <SortableHeader column={column} title="Amount" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatAmount(row.original.amount, row.original.currency)}
      </div>
    ),
  },
  {
    accessorKey: "currency",
    header: ({ column }) => <SortableHeader column={column} title="Currency" />,
  },
  {
    accessorKey: "relatedShipment",
    header: "Related shipment",
  },
  {
    accessorKey: "date",
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) =>
      row.original.notes ? (
        <span className="text-sm text-muted-foreground">{row.original.notes}</span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
]

type ExpenseTableProps = {
  expenses: ExpenseTableRow[]
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <DataTable
      columns={columns}
      data={expenses}
      searchKey="type"
      searchPlaceholder="Search expenses by type, currency, shipment, or notes..."
      emptyTitle="No expenses yet"
      emptyDescription="Add your first expense to start tracking operational costs."
    />
  )
}
