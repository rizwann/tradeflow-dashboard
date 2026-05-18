"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import { DeliveryStatusBadge } from "@/features/deliveries/delivery-status-badge"
import { DeliveryTableActions } from "@/features/deliveries/delivery-table-actions"
import { SaleTableActions } from "./sale-table-actions"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"
import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/types/app"

type SaleTableItem = {
  id: string
  productId: string | null
  productName: string
  productSku: string | null
  quantity: number
  unitSellingPriceBdt: number
  discount: number
  revenue: number
}

export type SaleTableRow = {
  id: string
  items: SaleTableItem[]
  itemSummary: string
  itemCount: number
  totalQuantity: number
  totalRevenue: number
  paymentStatus: "paid" | "unpaid" | "partial"
  saleDate: string
  soldBy: string
  customerId: string | null
  customerName: string | null
  customerPhone: string | null
  customerCreatedBy: string | null
  deliveryId: string | null
  deliveryStatus: "pending" | "shipped" | "delivered" | "cancelled" | null
  deliveryMethod: string | null
  deliveryTrackingNumber: string | null
  deliveryCost: number | null
  deliveryCostPaidBy: "business" | "customer" | null
  deliveryShippedAt: string | null
  deliveryDeliveredAt: string | null
  deliveryNotes: string | null
  deliveryCreatedBy: string | null
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

function formatQuantity(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString("en-US")
    : value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
}

function getSaleActionLabel(sale: SaleTableRow) {
  if (sale.items.length === 0) {
    return "this order"
  }

  if (sale.items.length === 1) {
    return sale.items[0]?.productName ?? "this order"
  }

  const firstTwoItems = sale.items.slice(0, 2).map((item) => item.productName)
  const remainder = sale.items.length - firstTwoItems.length

  return remainder > 0
    ? `${firstTwoItems.join(", ")} and ${remainder} more item${remainder === 1 ? "" : "s"}`
    : firstTwoItems.join(", ")
}

function ItemNameLink({ item }: { item: SaleTableItem }) {
  if (!item.productId) {
    return <span className="font-medium">{item.productName}</span>
  }

  return (
    <Link
      href={`/products/${item.productId}`}
      aria-label={`View product details for ${item.productName}`}
      className="font-medium transition-colors hover:text-primary hover:underline underline-offset-4"
    >
      {item.productName}
    </Link>
  )
}

function SaleItemsCell({ sale }: { sale: SaleTableRow }) {
  if (sale.items.length === 0) {
    return <div className="font-medium text-muted-foreground">No line items</div>
  }

  if (sale.items.length === 1) {
    const item = sale.items[0]

    return (
      <div className="space-y-1">
        <ItemNameLink item={item} />
        <div className="text-xs text-muted-foreground">
          {[item.productSku, `Qty ${formatQuantity(item.quantity)}`]
            .filter(Boolean)
            .join(" · ")}
        </div>
        {sale.status === "voided" && sale.voidReason ? (
          <div className="text-xs text-muted-foreground">
            Reason: {sale.voidReason}
          </div>
        ) : null}
      </div>
    )
  }

  const visibleItems = sale.items.slice(0, 2)
  const hiddenCount = sale.items.length - visibleItems.length

  return (
    <div className="space-y-1.5">
      {visibleItems.map((item) => (
        <div key={item.id} className="text-sm">
          <ItemNameLink item={item} />
          <span className="text-muted-foreground">
            {" "}
            x{formatQuantity(item.quantity)}
          </span>
        </div>
      ))}
      {hiddenCount > 0 ? (
        <div className="text-xs font-medium text-muted-foreground">
          +{hiddenCount} more
        </div>
      ) : null}
      {sale.status === "voided" && sale.voidReason ? (
        <div className="text-xs text-muted-foreground">
          Reason: {sale.voidReason}
        </div>
      ) : null}
    </div>
  )
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
  const canManageDelivery =
    currentUserRole === "admin" ||
    sale.soldBy === currentUserId ||
    sale.customerCreatedBy === currentUserId ||
    sale.deliveryCreatedBy === currentUserId
  const visibleItems = sale.items.slice(0, 3)
  const hiddenCount = sale.items.length - visibleItems.length

  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-[-0.02em]">
            {sale.customerName ? (
              sale.customerId ? (
                <Link
                  href={`/customers/${sale.customerId}`}
                  className="transition-colors hover:text-primary"
                >
                  {sale.customerName}
                </Link>
              ) : (
                sale.customerName
              )
            ) : (
              "Walk-in customer"
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(sale.saleDate)}
          </p>
          {sale.customerPhone ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {sale.customerPhone}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={sale.status === "voided" ? "secondary" : "outline"}>
            {formatSaleStatus(sale.status)}
          </Badge>
          {sale.deliveryStatus ? (
            <DeliveryStatusBadge status={sale.deliveryStatus} />
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Items
        </p>
        {visibleItems.length > 0 ? (
          <div className="space-y-2">
            {visibleItems.map((item) => (
              <div key={item.id} className="surface-tile px-3 py-3 text-sm">
                <ItemNameLink item={item} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {[item.productSku, `Qty ${formatQuantity(item.quantity)}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            ))}
            {hiddenCount > 0 ? (
              <p className="text-xs font-medium text-muted-foreground">
                +{hiddenCount} more
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No line items</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Items count
          </p>
          <p className="mt-2 text-sm font-semibold">{sale.itemCount}</p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Total quantity
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatQuantity(sale.totalQuantity)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Revenue
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatBDT(sale.totalRevenue)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Payment
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatPaymentStatus(sale.paymentStatus)}
          </p>
        </div>
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        {sale.deliveryStatus ? (
          <>
            Delivery: <span className="font-medium text-foreground">{sale.deliveryStatus}</span>
          </>
        ) : (
          "Delivery: Not started"
        )}
      </div>

      {sale.deliveryStatus && sale.deliveryCost != null && sale.deliveryCostPaidBy ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {formatBDT(sale.deliveryCost)} · {sale.deliveryCostPaidBy} paid
        </p>
      ) : null}

      {sale.status === "voided" && sale.voidReason ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Reason: {sale.voidReason}
        </p>
      ) : null}

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <DeliveryTableActions
            saleId={sale.id}
            saleStatus={sale.status}
            customerId={sale.customerId}
            customerName={sale.customerName ?? "customer"}
            canManage={canManageDelivery}
            delivery={
              sale.deliveryId && sale.deliveryStatus && sale.deliveryCostPaidBy
                ? {
                    id: sale.deliveryId,
                    status: sale.deliveryStatus,
                    delivery_method: sale.deliveryMethod,
                    tracking_number: sale.deliveryTrackingNumber,
                    delivery_cost: sale.deliveryCost ?? 0,
                    delivery_cost_paid_by: sale.deliveryCostPaidBy,
                    shipped_at: sale.deliveryShippedAt,
                    delivered_at: sale.deliveryDeliveredAt,
                    notes: sale.deliveryNotes,
                  }
                : null
            }
          />
          <SaleTableActions
            saleId={sale.id}
            saleStatus={sale.status}
            productName={getSaleActionLabel(sale)}
            soldBy={sale.soldBy}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        </div>
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
      accessorKey: "customerName",
      header: ({ column }) => <SortableHeader column={column} title="Customer" />,
      cell: ({ row }) => {
        if (!row.original.customerName) {
          return "—"
        }

        const content = (
          <div>
            <div className="font-medium">{row.original.customerName}</div>
            {row.original.customerPhone ? (
              <div className="text-xs text-muted-foreground">
                {row.original.customerPhone}
              </div>
            ) : null}
          </div>
        )

        return row.original.customerId ? (
          <Link
            href={`/customers/${row.original.customerId}`}
            className="transition-colors hover:text-primary"
          >
            {content}
          </Link>
        ) : (
          content
        )
      },
    },
    {
      accessorKey: "itemSummary",
      header: ({ column }) => <SortableHeader column={column} title="Items" />,
      cell: ({ row }) => <SaleItemsCell sale={row.original} />,
    },
    {
      accessorKey: "itemCount",
      header: ({ column }) => (
        <SortableHeader column={column} title="Items count" align="right" />
      ),
      cell: ({ row }) => (
        <div className="text-right">{row.original.itemCount}</div>
      ),
    },
    {
      accessorKey: "totalQuantity",
      header: ({ column }) => (
        <SortableHeader column={column} title="Total quantity" align="right" />
      ),
      cell: ({ row }) => (
        <div className="text-right">{formatQuantity(row.original.totalQuantity)}</div>
      ),
    },
    {
      accessorKey: "totalRevenue",
      header: ({ column }) => (
        <SortableHeader column={column} title="Revenue" align="right" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatBDT(row.original.totalRevenue)}
        </div>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => formatPaymentStatus(row.original.paymentStatus),
    },
    {
      accessorKey: "deliveryStatus",
      header: "Delivery",
      cell: ({ row }) =>
        row.original.deliveryStatus ? (
          <DeliveryStatusBadge status={row.original.deliveryStatus} />
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "voided" ? "secondary" : "outline"}
        >
          {formatSaleStatus(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "saleDate",
      header: ({ column }) => <SortableHeader column={column} title="Date" />,
      cell: ({ row }) => formatDate(row.original.saleDate),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const canManageDelivery =
          currentUserRole === "admin" ||
          row.original.soldBy === currentUserId ||
          row.original.customerCreatedBy === currentUserId ||
          row.original.deliveryCreatedBy === currentUserId

        return (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <DeliveryTableActions
              saleId={row.original.id}
              saleStatus={row.original.status}
              customerId={row.original.customerId}
              customerName={row.original.customerName ?? "customer"}
              canManage={canManageDelivery}
              delivery={
                row.original.deliveryId &&
                row.original.deliveryStatus &&
                row.original.deliveryCostPaidBy
                  ? {
                      id: row.original.deliveryId,
                      status: row.original.deliveryStatus,
                      delivery_method: row.original.deliveryMethod,
                      tracking_number: row.original.deliveryTrackingNumber,
                      delivery_cost: row.original.deliveryCost ?? 0,
                      delivery_cost_paid_by: row.original.deliveryCostPaidBy,
                      shipped_at: row.original.deliveryShippedAt,
                      delivered_at: row.original.deliveryDeliveredAt,
                      notes: row.original.deliveryNotes,
                    }
                  : null
              }
            />
            <SaleTableActions
              saleId={row.original.id}
              saleStatus={row.original.status}
              productName={getSaleActionLabel(row.original)}
              soldBy={row.original.soldBy}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          </div>
        )
      },
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
      searchKey="itemSummary"
      searchPlaceholder="Search sales by item, customer, payment, or delivery status..."
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
