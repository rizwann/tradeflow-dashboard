import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  PencilLine,
  Phone,
  Wallet,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  calculateCustomerDetailInsights,
  calculateSaleRevenue,
} from "@/features/analytics/customer-delivery-analytics"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type CustomerDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

type CustomerRecord = {
  id: string
  name: string
  phone: string
  address: string | null
  city: string | null
  notes: string | null
  created_at: string | null
  created_by: string | null
}

type CustomerSaleRow = {
  id: string
  product_id: string
  quantity: number
  unit_selling_price_bdt: number
  discount: number | null
  sale_date: string
  payment_status: "paid" | "unpaid" | "partial"
  status: "active" | "voided"
  products: {
    name: string
  } | null
}

type DeliveryRow = {
  id: string
  sale_id: string
  status: "pending" | "shipped" | "delivered" | "cancelled"
  delivery_method: string | null
  tracking_number: string | null
  delivery_cost: number
  delivery_cost_paid_by: "business" | "customer"
  shipped_at: string | null
  delivered_at: string | null
  created_at: string | null
}

type CustomerSaleProfitRow = {
  sale_id: string
  gross_profit: number
}

export async function generateMetadata({
  params,
}: CustomerDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from("customers")
    .select("name")
    .eq("id", id)
    .maybeSingle<{ name: string }>()

  return {
    title: customer?.name ?? "Customer",
  }
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

function formatDateTime(value: string | null) {
  if (!value) return "Not available"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getCustomerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function getPaymentBadgeClassName(
  status: CustomerSaleRow["payment_status"],
) {
  if (status === "paid") {
    return "border-emerald-200/80 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300"
  }

  if (status === "partial") {
    return "border-amber-200/80 bg-amber-500/10 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300"
  }

  return "border-red-200/80 bg-red-500/10 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300"
}

function getSaleStatusBadgeClassName(status: CustomerSaleRow["status"]) {
  if (status === "active") {
    return "border-sky-200/80 bg-sky-500/10 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300"
  }

  return "border-slate-300/70 bg-slate-500/10 text-slate-700 dark:border-slate-500/25 dark:bg-slate-500/15 dark:text-slate-300"
}

function getDeliveryStatusBadgeClassName(status: DeliveryRow["status"]) {
  if (status === "delivered") {
    return "border-emerald-200/80 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300"
  }

  if (status === "shipped") {
    return "border-sky-200/80 bg-sky-500/10 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300"
  }

  if (status === "cancelled") {
    return "border-red-200/80 bg-red-500/10 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300"
  }

  return "border-amber-200/80 bg-amber-500/10 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300"
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const session = await requireRole(["admin", "partner"])
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: customer, error: customerError },
    { data: sales, error: salesError },
    { data: deliveries, error: deliveriesError },
    { data: saleProfits, error: saleProfitsError },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, phone, address, city, notes, created_at, created_by")
      .eq("id", id)
      .maybeSingle()
      .returns<CustomerRecord | null>(),
    supabase
      .from("sales")
      .select(
        "id, product_id, quantity, unit_selling_price_bdt, discount, sale_date, payment_status, status, products(name)",
      )
      .eq("customer_id", id)
      .order("sale_date", { ascending: false })
      .returns<CustomerSaleRow[]>(),
    supabase
      .from("sales_deliveries")
      .select(
        "id, sale_id, status, delivery_method, tracking_number, delivery_cost, delivery_cost_paid_by, shipped_at, delivered_at, created_at",
      )
      .eq("customer_id", id)
      .order("created_at", { ascending: false })
      .returns<DeliveryRow[]>(),
    supabase
      .from("sale_batch_consumptions")
      .select("sale_id, gross_profit, sales!inner(customer_id, status)")
      .eq("sales.customer_id", id)
      .eq("sales.status", "active")
      .returns<CustomerSaleProfitRow[]>(),
  ])

  if (customerError || salesError || deliveriesError || saleProfitsError) {
    throw customerError ?? salesError ?? deliveriesError ?? saleProfitsError
  }

  if (!customer) {
    notFound()
  }

  const canEditCustomer =
    session.profile.role === "admin" || customer.created_by === session.user.id

  const salesWithRevenue = (sales ?? []).map((sale) => ({
    ...sale,
    revenue: calculateSaleRevenue({
      quantity: Number(sale.quantity),
      unitSellingPriceBdt: Number(sale.unit_selling_price_bdt),
      discount: sale.discount,
    }),
  }))

  const totalOrders = salesWithRevenue.length
  const activeOrders = salesWithRevenue.filter(
    (sale) => sale.status === "active",
  )
  const customerDetailInsights = calculateCustomerDetailInsights({
    sales: activeOrders.map((sale) => ({
      id: sale.id,
      customerId: id,
      customerName: customer.name,
      productId: sale.product_id,
      productName: sale.products?.name ?? null,
      quantity: Number(sale.quantity),
      unitSellingPriceBdt: Number(sale.unit_selling_price_bdt),
      discount: sale.discount,
      saleDate: sale.sale_date,
    })),
    deliveries: (deliveries ?? []).map((delivery) => ({
      status: delivery.status,
      deliveryCost: Number(delivery.delivery_cost),
      deliveryCostPaidBy: delivery.delivery_cost_paid_by,
    })),
    saleProfits: (saleProfits ?? []).map((saleProfit) => ({
      saleId: saleProfit.sale_id,
      grossProfit: Number(saleProfit.gross_profit),
    })),
  })
  const salesById = new Map(salesWithRevenue.map((sale) => [sale.id, sale]))

  return (
    <div className="space-y-10">
      <PageHeader
        title={customer.name}
        description="Customer profile, order summary, and delivery history."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/customers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customers
              </Link>
            </Button>
            {canEditCustomer ? (
              <Button asChild>
                <Link href={`/customers/${customer.id}/edit`}>
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit customer
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <p className="eyebrow-label">Customer Profile</p>
            <CardTitle>Buyer overview</CardTitle>
            <CardDescription>
              Core identity and relationship context for repeat sales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-18 w-18 items-center justify-center rounded-[1.7rem] bg-primary/12 text-2xl font-semibold tracking-[0.06em] text-primary">
                {getCustomerInitials(customer.name)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                    {customer.name}
                  </h2>
                  {customerDetailInsights.activeOrders > 1 ? (
                    <Badge variant="outline">Returning customer</Badge>
                  ) : null}
                </div>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="surface-panel-subtle rounded-[1.45rem] px-4 py-4">
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Added
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight">
                  {formatDate(customer.created_at)}
                </p>
              </div>
              <div className="surface-panel-subtle rounded-[1.45rem] px-4 py-4">
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Latest Order
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight">
                  {formatDate(customerDetailInsights.lastOrderDate)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="surface-panel-subtle rounded-[1.45rem] px-4 py-4">
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Repeat Purchase Signal
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight">
                  {customerDetailInsights.activeOrders > 1
                    ? "Repeat buyer"
                    : "Single active order"}
                </p>
              </div>
              <div className="surface-panel-subtle rounded-[1.45rem] px-4 py-4">
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Latest Delivery Status
                </p>
                <div className="mt-2">
                  {customerDetailInsights.latestDeliveryStatus ? (
                    <Badge
                      variant="outline"
                      className={getDeliveryStatusBadgeClassName(
                        customerDetailInsights.latestDeliveryStatus,
                      )}
                    >
                      {formatLabel(customerDetailInsights.latestDeliveryStatus)}
                    </Badge>
                  ) : (
                    <p className="text-base font-semibold tracking-tight">
                      No delivery yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {customer.notes ? (
              <div className="rounded-[1.45rem] border border-border/60 bg-muted/24 px-4 py-4">
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground/95">
                  {customer.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <p className="eyebrow-label">Contact & Address</p>
            <CardTitle>Delivery-ready contact info</CardTitle>
            <CardDescription>
              Phone, city, and address details used for follow-up and fulfilment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="surface-panel-subtle rounded-[1.45rem] px-4 py-4">
              <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <p className="mt-2 text-base font-semibold tracking-tight">
                {customer.phone}
              </p>
            </div>

            <div className="surface-panel-subtle rounded-[1.45rem] px-4 py-4">
              <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                <MapPin className="h-4 w-4" />
                City
              </div>
              <p className="mt-2 text-base font-semibold tracking-tight">
                {customer.city ?? "Not set"}
              </p>
            </div>

            <div className="surface-panel-subtle rounded-[1.45rem] px-4 py-4">
              <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                <MapPin className="h-4 w-4" />
                Address
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground/95">
                {customer.address ?? "No address saved yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total orders"
          value={totalOrders.toLocaleString("en-US")}
          description="All recorded orders, including voided sales."
        />
        <MetricCard
          title="Customer lifetime value"
          value={formatBDT(customerDetailInsights.totalRevenue)}
          description="Active-sale revenue attributed to this customer."
        />
        <MetricCard
          title="Total profit"
          value={formatBDT(customerDetailInsights.totalProfit)}
          description="FIFO-backed gross profit from active linked sales."
        />
        <MetricCard
          title="Average order value"
          value={formatBDT(customerDetailInsights.averageOrderValue)}
          description="Average value across active orders."
        />
        <MetricCard
          title="Delivered orders"
          value={customerDetailInsights.deliveredOrders.toLocaleString("en-US")}
          description="Linked deliveries completed for this customer."
        />
        <MetricCard
          title="Pending deliveries"
          value={customerDetailInsights.pendingDeliveries.toLocaleString("en-US")}
          description="Customer orders still waiting for fulfilment."
        />
        <MetricCard
          title="Total delivery spend"
          value={formatBDT(customerDetailInsights.totalDeliverySpend)}
          description="Total non-cancelled delivery cost on linked deliveries."
        />
        <MetricCard
          title="Favorite product"
          value={customerDetailInsights.favoriteProduct?.productName ?? "No repeat product yet"}
          description={
            customerDetailInsights.favoriteProduct
              ? `${customerDetailInsights.favoriteProduct.quantitySold.toLocaleString("en-US")} units across ${customerDetailInsights.favoriteProduct.ordersCount.toLocaleString("en-US")} active orders.`
              : "More active sales are needed to surface a repeat product."
          }
        />
        <MetricCard
          title="Last order date"
          value={formatDate(customerDetailInsights.lastOrderDate)}
          description="Most recent linked sale date on record."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <p className="eyebrow-label">Order Timeline</p>
            <CardTitle>Sales linked to this customer</CardTitle>
            <CardDescription>
              Product, revenue, payment state, and order status in reverse chronology.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesWithRevenue.length === 0 ? (
              <EmptyState
                title="No customer orders yet"
                description="Orders connected to this customer will appear here."
              />
            ) : (
              <>
                <div className="grid gap-3 md:hidden">
                  {salesWithRevenue.map((sale) => (
                    <div
                      key={sale.id}
                      className="surface-panel-subtle rounded-[1.45rem] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${sale.product_id}`}
                            aria-label={`View product details for ${sale.products?.name ?? "Unknown product"}`}
                            className="font-semibold tracking-[-0.02em] transition-colors hover:text-primary hover:underline underline-offset-4"
                          >
                            {sale.products?.name ?? "Unknown product"}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(sale.sale_date)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getSaleStatusBadgeClassName(sale.status)}
                        >
                          {formatLabel(sale.status)}
                        </Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="surface-tile px-3 py-3">
                          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                            Quantity
                          </p>
                          <p className="mt-2 text-sm font-semibold">
                            {sale.quantity.toLocaleString("en-US")}
                          </p>
                        </div>
                        <div className="surface-tile px-3 py-3">
                          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                            Revenue
                          </p>
                          <p className="mt-2 text-sm font-semibold">
                            {formatBDT(sale.revenue)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={getPaymentBadgeClassName(sale.payment_status)}
                        >
                          {formatLabel(sale.payment_status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[46rem]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead>Sale date</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesWithRevenue.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">
                              <Link
                                href={`/products/${sale.product_id}`}
                                aria-label={`View product details for ${sale.products?.name ?? "Unknown product"}`}
                                className="transition-colors hover:text-primary hover:underline underline-offset-4"
                              >
                                {sale.products?.name ?? "Unknown product"}
                              </Link>
                            </TableCell>
                            <TableCell className="text-right">
                              {sale.quantity.toLocaleString("en-US")}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatBDT(sale.revenue)}
                            </TableCell>
                            <TableCell>{formatDate(sale.sale_date)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getPaymentBadgeClassName(
                                  sale.payment_status,
                                )}
                              >
                                {formatLabel(sale.payment_status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getSaleStatusBadgeClassName(sale.status)}
                              >
                                {formatLabel(sale.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <p className="eyebrow-label">Delivery Timeline</p>
            <CardTitle>Shipment and handoff progress</CardTitle>
            <CardDescription>
              Delivery status, cost ownership, and fulfilment timing in sequence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveries && deliveries.length > 0 ? (
              <div className="space-y-3">
                {deliveries.map((delivery) => {
                  const relatedSale = salesById.get(delivery.sale_id)

                  return (
                    <div
                      key={delivery.id}
                      className="surface-panel-subtle rounded-[1.45rem] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          {relatedSale ? (
                            <Link
                              href={`/products/${relatedSale.product_id}`}
                              aria-label={`View product details for ${relatedSale.products?.name ?? "Linked order"}`}
                              className="font-semibold tracking-[-0.02em] transition-colors hover:text-primary hover:underline underline-offset-4"
                            >
                              {relatedSale.products?.name ?? "Linked order"}
                            </Link>
                          ) : (
                            <p className="font-semibold tracking-[-0.02em]">
                              Linked order
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            Sale date: {formatDate(relatedSale?.sale_date ?? null)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getDeliveryStatusBadgeClassName(delivery.status)}
                        >
                          {formatLabel(delivery.status)}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="surface-tile px-3 py-3">
                          <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                            <Wallet className="h-4 w-4" />
                            Delivery Cost
                          </div>
                          <p className="mt-2 text-sm font-semibold">
                            {formatBDT(delivery.delivery_cost)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Paid by {formatLabel(delivery.delivery_cost_paid_by)}
                          </p>
                          {delivery.delivery_method ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {delivery.delivery_method}
                              {delivery.tracking_number
                                ? ` · ${delivery.tracking_number}`
                                : ""}
                            </p>
                          ) : null}
                        </div>
                        <div className="surface-tile px-3 py-3">
                          <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                            <CalendarDays className="h-4 w-4" />
                            Timeline
                          </div>
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            Shipped: {formatDateTime(delivery.shipped_at)}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Delivered: {formatDateTime(delivery.delivered_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title="No delivery history yet"
                description="Linked delivery updates will appear here once delivery tracking starts."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
