"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, PencilLine } from "lucide-react"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { SortableHeader } from "@/components/shared/sortable-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types/app"

export type CustomerSummaryRow = {
  id: string
  name: string
  phone: string
  city: string | null
  address: string | null
  notes: string | null
  createdAt: string | null
  createdBy: string | null
  ordersCount: number
  totalRevenue: number
  totalProfit: number
  lastOrderDate: string | null
}

type CustomerTableProps = {
  customers: CustomerSummaryRow[]
  currentUserId: string
  currentUserRole: UserRole
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

function canEditCustomer(
  customer: CustomerSummaryRow,
  currentUserId: string,
  currentUserRole: UserRole,
) {
  return currentUserRole === "admin" || customer.createdBy === currentUserId
}

function CustomerMobileCard({
  customer,
  currentUserId,
  currentUserRole,
}: {
  customer: CustomerSummaryRow
  currentUserId: string
  currentUserRole: UserRole
}) {
  const canEdit = canEditCustomer(customer, currentUserId, currentUserRole)

  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/customers/${customer.id}`}
            className="block font-semibold tracking-[-0.02em] transition-colors hover:text-primary"
          >
            {customer.name}
          </Link>
          {customer.ordersCount > 1 ? (
            <Badge variant="outline" className="mt-2">
              Returning customer
            </Badge>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">{customer.phone}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)]"
          >
            <Link
              href={`/customers/${customer.id}`}
              aria-label={`View customer ${customer.name}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canEdit ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)]"
            >
              <Link
                href={`/customers/${customer.id}/edit`}
                aria-label={`Edit customer ${customer.name}`}
              >
                <PencilLine className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            City
          </p>
          <p className="mt-2 text-sm font-medium">{customer.city ?? "Not set"}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Orders
          </p>
          <p className="mt-2 text-sm font-semibold">
            {customer.ordersCount.toLocaleString("en-US")}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Revenue
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatBDT(customer.totalRevenue)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Last Order
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatDate(customer.lastOrderDate)}
          </p>
        </div>
      </div>
    </div>
  )
}

function getColumns(
  currentUserId: string,
  currentUserRole: UserRole,
): ColumnDef<CustomerSummaryRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div>
          <Link
            href={`/customers/${row.original.id}`}
            className="font-medium transition-colors hover:text-primary"
          >
            {row.original.name}
          </Link>
          {row.original.ordersCount > 1 ? (
            <div className="mt-1">
              <Badge variant="outline">Returning customer</Badge>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <SortableHeader column={column} title="Phone" />,
    },
    {
      accessorKey: "city",
      header: ({ column }) => <SortableHeader column={column} title="City" />,
      cell: ({ row }) => row.original.city ?? "—",
    },
    {
      accessorKey: "ordersCount",
      header: ({ column }) => (
        <SortableHeader column={column} title="Orders count" align="right" />
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.ordersCount.toLocaleString("en-US")}
        </div>
      ),
    },
    {
      accessorKey: "totalRevenue",
      header: ({ column }) => (
        <SortableHeader column={column} title="Total revenue" align="right" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatBDT(row.original.totalRevenue)}
        </div>
      ),
    },
    {
      accessorKey: "lastOrderDate",
      header: ({ column }) => (
        <SortableHeader column={column} title="Last order date" />
      ),
      cell: ({ row }) => formatDate(row.original.lastOrderDate),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const canEdit = canEditCustomer(
          row.original,
          currentUserId,
          currentUserRole,
        )

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <Link
                href={`/customers/${row.original.id}`}
                aria-label={`View customer ${row.original.name}`}
              >
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {canEdit ? (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <Link
                  href={`/customers/${row.original.id}/edit`}
                  aria-label={`Edit customer ${row.original.name}`}
                >
                  <PencilLine className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        )
      },
    },
  ]
}

export function CustomerTable({
  customers,
  currentUserId,
  currentUserRole,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <EmptyState
        title="No customers yet"
        description="Add your first customer to start tracking repeat buyers and orders."
        action={
          <Button asChild>
            <Link href="/customers/new">Add customer</Link>
          </Button>
        }
      />
    )
  }

  return (
    <DataTable
      columns={getColumns(currentUserId, currentUserRole)}
      data={customers}
      searchKey="name"
      searchPlaceholder="Search customers by name, phone, or city..."
      emptyTitle="No customers found"
      emptyDescription="Try adjusting your search."
      mobileCardRenderer={(customer) => (
        <CustomerMobileCard
          customer={customer}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}
    />
  )
}
