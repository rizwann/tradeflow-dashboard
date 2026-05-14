import type { Metadata } from "next"

import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { DeliveryTable, type DeliveryTableRow } from "@/features/deliveries/delivery-table"
import { DeliveriesExportButton } from "@/features/deliveries/deliveries-export-button"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Deliveries",
}

type DeliveryRecord = {
  id: string
  sale_id: string
  customer_id: string | null
  status: "pending" | "shipped" | "delivered" | "cancelled"
  delivery_method: string | null
  tracking_number: string | null
  delivery_cost: number
  delivery_cost_paid_by: "business" | "customer"
  shipped_at: string | null
  delivered_at: string | null
  notes: string | null
  created_by: string | null
  sales: {
    sale_date: string
    sold_by: string
    status: "active" | "voided"
    products: {
      name: string
    } | null
  } | null
  customers: {
    name: string
    phone: string
    created_by: string | null
  } | null
}

export default async function DeliveriesPage() {
  const session = await requireRole(["admin", "partner"])
  const supabase = await createClient()

  const { data: deliveries, error } = await supabase
    .from("sales_deliveries")
    .select(
      "id, sale_id, customer_id, status, delivery_method, tracking_number, delivery_cost, delivery_cost_paid_by, shipped_at, delivered_at, notes, created_by, sales(sale_date, sold_by, status, products(name)), customers(name, phone, created_by)",
    )
    .order("created_at", { ascending: false })
    .returns<DeliveryRecord[]>()

  if (error) {
    return (
      <ErrorState
        title="Could not load deliveries"
        message={error.message}
      />
    )
  }

  const rows: DeliveryTableRow[] = (deliveries ?? []).map((delivery) => ({
    id: delivery.id,
    saleId: delivery.sale_id,
    saleStatus: delivery.sales?.status ?? "active",
    customerId: delivery.customer_id,
    customerName: delivery.customers?.name ?? "Unknown customer",
    customerPhone: delivery.customers?.phone ?? null,
    productName: delivery.sales?.products?.name ?? "Unknown product",
    saleDate: delivery.sales?.sale_date ?? "",
    status: delivery.status,
    deliveryMethod: delivery.delivery_method,
    trackingNumber: delivery.tracking_number,
    deliveryCost: Number(delivery.delivery_cost),
    deliveryCostPaidBy: delivery.delivery_cost_paid_by,
    shippedAt: delivery.shipped_at,
    deliveredAt: delivery.delivered_at,
    notes: delivery.notes,
    soldBy: delivery.sales?.sold_by ?? "",
    customerCreatedBy: delivery.customers?.created_by ?? null,
    deliveryCreatedBy: delivery.created_by,
  }))

  const exportRows = rows.map((row) => ({
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    productName: row.productName,
    saleDate: row.saleDate,
    status: row.status,
    deliveryMethod: row.deliveryMethod,
    trackingNumber: row.trackingNumber,
    deliveryCost: row.deliveryCost,
    deliveryCostPaidBy: row.deliveryCostPaidBy,
    shippedAt: row.shippedAt,
    deliveredAt: row.deliveredAt,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliveries"
        description="Track order fulfilment status, courier details, and delivery cost responsibility."
        actions={<DeliveriesExportButton rows={exportRows} />}
      />

      <DeliveryTable
        deliveries={rows}
        currentUserId={session.user.id}
        currentUserRole={session.profile.role}
      />
    </div>
  )
}
