import Link from "next/link"
import { Plus } from "lucide-react"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { SaleTable, type SaleTableRow } from "@/features/sales/sale-table"
import { SalesExportButton } from "@/features/sales/sales-export-button"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Sales",
}

type SalesPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

type SaleRow = {
  id: string
  quantity: number
  unit_selling_price_bdt: number
  discount: number | null
  sale_date: string
  payment_status: "paid" | "unpaid" | "partial"
  sold_by: string
  status: "active" | "voided"
  voided_at: string | null
  void_reason: string | null
  customer_id: string | null
  customer_name: string | null
  customers: {
    name: string
    phone: string
    created_by: string | null
  } | null
  sales_deliveries:
    | {
        id: string
        status: "pending" | "shipped" | "delivered" | "cancelled"
        delivery_method: string | null
        tracking_number: string | null
        delivery_cost: number
        delivery_cost_paid_by: "business" | "customer"
        shipped_at: string | null
        delivered_at: string | null
        notes: string | null
        created_by: string | null
      }[]
    | null
  products: {
    name: string
  } | null
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = await searchParams
  const session = await requireRole(["admin", "partner"])
  const supabase = await createClient()

  const { data: sales, error } = await supabase
    .from("sales")
    .select(
      "id, quantity, unit_selling_price_bdt, discount, sale_date, payment_status, sold_by, status, voided_at, void_reason, customer_id, customer_name, customers(name, phone, created_by), sales_deliveries(id, status, delivery_method, tracking_number, delivery_cost, delivery_cost_paid_by, shipped_at, delivered_at, notes, created_by), products(name)",
    )
    .order("created_at", { ascending: false })
    .returns<SaleRow[]>()

  if (error) {
    return <ErrorState title="Could not load sales" message={error.message} />
  }

  const saleRows: SaleTableRow[] = (sales ?? []).map((sale) => {
    const discount = Number(sale.discount ?? 0)
    const delivery = sale.sales_deliveries?.[0] ?? null

    return {
      id: sale.id,
      productName: sale.products?.name ?? "Unknown product",
      quantity: sale.quantity,
      unitSellingPriceBdt: sale.unit_selling_price_bdt,
      discount,
      revenue: sale.quantity * sale.unit_selling_price_bdt - discount,
      paymentStatus: sale.payment_status,
      saleDate: sale.sale_date,
      soldBy: sale.sold_by,
      customerId: sale.customer_id,
      customerName: sale.customers?.name ?? sale.customer_name,
      customerPhone: sale.customers?.phone ?? null,
      customerCreatedBy: sale.customers?.created_by ?? null,
      deliveryId: delivery?.id ?? null,
      deliveryStatus: delivery?.status ?? null,
      deliveryMethod: delivery?.delivery_method ?? null,
      deliveryTrackingNumber: delivery?.tracking_number ?? null,
      deliveryCost: delivery ? Number(delivery.delivery_cost) : null,
      deliveryCostPaidBy: delivery?.delivery_cost_paid_by ?? null,
      deliveryShippedAt: delivery?.shipped_at ?? null,
      deliveryDeliveredAt: delivery?.delivered_at ?? null,
      deliveryNotes: delivery?.notes ?? null,
      deliveryCreatedBy: delivery?.created_by ?? null,
      status: sale.status,
      voidedAt: sale.voided_at,
      voidReason: sale.void_reason,
    }
  })

  const saleExportRows = (sales ?? []).map((sale) => {
    const discount = Number(sale.discount ?? 0)
    const delivery = sale.sales_deliveries?.[0] ?? null

    return {
      productName: sale.products?.name ?? "Unknown product",
      quantity: sale.quantity,
      unit_selling_price_bdt: sale.unit_selling_price_bdt,
      discount,
      revenue: sale.quantity * sale.unit_selling_price_bdt - discount,
      sale_date: sale.sale_date,
      payment_status: sale.payment_status,
      status: sale.status,
      customer_name: sale.customers?.name ?? sale.customer_name,
      customer_phone: sale.customers?.phone ?? null,
      delivery_status: delivery?.status ?? null,
      delivery_cost: delivery ? Number(delivery.delivery_cost) : null,
      delivery_cost_paid_by: delivery?.delivery_cost_paid_by ?? null,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Record Bangladesh-side sales and customer payments."
        actions={
          <>
            <SalesExportButton rows={saleExportRows} />
            <Button asChild>
              <Link href="/sales/new">
                <Plus className="mr-2 h-4 w-4" />
                Record sale
              </Link>
            </Button>
          </>
        }
      />

      {params.error === "no-bangladesh-stock" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          This product has no Bangladesh inventory. Receive a shipment before
          recording a sale.
        </div>
      ) : null}

      {params.error === "insufficient-bangladesh-stock" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Not enough Bangladesh inventory for this sale quantity.
        </div>
      ) : null}

      {params.error === "insufficient-fifo-batches" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          This product has Bangladesh inventory, but no matching FIFO cost
          batches. Receive a shipment again or check inventory batch data.
        </div>
      ) : null}

      <SaleTable
        sales={saleRows}
        currentUserId={session.user.id}
        currentUserRole={session.profile.role}
      />
    </div>
  )
}
