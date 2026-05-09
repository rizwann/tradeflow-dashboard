"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { ExpenseTableActions } from "./expense-table-actions"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"
import type { UserRole } from "@/types/app"

export type ExpenseTableRow = {
  id: string
  type: "shipping" | "customs" | "packaging" | "marketing" | "delivery" | "other"
  amount: number
  currency: string
  relatedShipment: string
  date: string
  notes: string
  paidById: string
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

function ExpenseMobileCard({
  expense,
  currentUserId,
  currentUserRole,
}: {
  expense: ExpenseTableRow
  currentUserId: string
  currentUserRole: UserRole
}) {
  const canEdit =
    currentUserRole === "admin" || expense.paidById === currentUserId
  const canDelete = currentUserRole === "admin"

  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-[-0.02em]">
            {formatType(expense.type)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(expense.date)}
          </p>
        </div>
        <p className="text-sm font-semibold">
          {formatAmount(expense.amount, expense.currency)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Currency
          </p>
          <p className="mt-2 text-sm font-medium">{expense.currency}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Shipment
          </p>
          <p className="mt-2 text-sm font-medium">
            {expense.relatedShipment || "No shipment"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {expense.notes
          ? expense.notes.length > 96
            ? `${expense.notes.slice(0, 96)}...`
            : expense.notes
          : "No notes recorded."}
      </p>

      <div className="mt-4">
        <ExpenseTableActions
          expenseId={expense.id}
          expenseType={formatType(expense.type)}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </div>
  )
}

function getColumns(
  currentUserId: string,
  currentUserRole: UserRole,
): ColumnDef<ExpenseTableRow>[] {
  return [
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
    cell: ({ row }) => formatDate(row.original.date),
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
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const canEdit =
          currentUserRole === "admin" || row.original.paidById === currentUserId
        const canDelete = currentUserRole === "admin"

        return (
          <ExpenseTableActions
            expenseId={row.original.id}
            expenseType={formatType(row.original.type)}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )
      },
    },
  ]
}

type ExpenseTableProps = {
  expenses: ExpenseTableRow[]
  currentUserId: string
  currentUserRole: UserRole
}

export function ExpenseTable({
  expenses,
  currentUserId,
  currentUserRole,
}: ExpenseTableProps) {
  return (
    <DataTable
      columns={getColumns(currentUserId, currentUserRole)}
      data={expenses}
      searchKey="type"
      searchPlaceholder="Search expenses by type, currency, shipment, or notes..."
      emptyTitle="No expenses yet"
      emptyDescription="Add your first expense to start tracking operational costs."
      mobileCardRenderer={(expense) => (
        <ExpenseMobileCard
          expense={expense}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}
    />
  )
}
