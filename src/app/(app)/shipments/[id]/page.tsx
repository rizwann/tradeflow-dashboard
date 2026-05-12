import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  ClipboardList,
  PencilLine,
  Plane,
  ShieldCheck,
  Truck,
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
import { getCurrentUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ShipmentStatusActions } from "@/features/shipments/shipment-status-actions"

type ShipmentDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: ShipmentDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: shipment } = await supabase
    .from("shipments")
    .select("shipment_code")
    .eq("id", id)
    .maybeSingle<{ shipment_code: string }>()

  return {
    title: shipment?.shipment_code ?? "Shipment",
  }
}

type ShipmentStatus =
  | "draft"
  | "sent"
  | "in_transit"
  | "received"
  | "lost_damaged"

type ShipmentRow = {
  id: string
  shipment_code: string
  carrier_name: string | null
  method: "luggage" | "courier" | "cargo"
  status: ShipmentStatus
  sent_date: string | null
  expected_arrival_date: string | null
  received_date: string | null
  shipping_cost: number
  customs_cost: number
  notes: string | null
  created_at: string
}

type ShipmentItemRow = {
  product_id: string
  quantity: number
  allocated_cost: number
  allocated_shipping_cost: number
  allocated_customs_cost: number
  landed_cost_per_unit: number
  products: {
    name: string
    sku: string
    purchase_price_bdt: number
  } | null
}

type InventoryBatchRow = {
  id: string
  product_id: string
  shipment_id?: string | null
  original_quantity?: number | null
  remaining_quantity?: number | null
  landed_cost_per_unit?: number | null
  received_at?: string | null
}

type AuditLogRow = {
  action: string
  metadata: Record<string, unknown> | null
  created_at: string
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US")
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

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
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

function getMetadataEntries(metadata: Record<string, unknown> | null) {
  if (!metadata) return []

  return Object.entries(metadata).filter(([, value]) => value != null)
}

export default async function ShipmentDetailPage({
  params,
}: ShipmentDetailPageProps) {
  const session = await getCurrentUserProfile()
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: shipment, error: shipmentError },
    { data: shipmentItems, error: itemsError },
    { data: inventoryBatches, error: batchesError },
    { data: auditLogs, error: auditError },
  ] = await Promise.all([
    supabase
      .from("shipments")
      .select(
        "id, shipment_code, carrier_name, method, status, sent_date, expected_arrival_date, received_date, shipping_cost, customs_cost, notes, created_at",
      )
      .eq("id", id)
      .maybeSingle()
      .returns<ShipmentRow | null>(),
    supabase
      .from("shipment_items")
      .select(
        `
        product_id,
        quantity,
        allocated_cost,
        allocated_shipping_cost,
        allocated_customs_cost,
        landed_cost_per_unit,
        products (
          name,
          sku,
          purchase_price_bdt
        )
      `,
      )
      .eq("shipment_id", id)
      .returns<ShipmentItemRow[]>(),
    supabase
      .from("inventory_batches")
      .select("*")
      .eq("shipment_id", id)
      .order("received_at", { ascending: false })
      .returns<InventoryBatchRow[]>(),
    supabase
      .from("audit_logs")
      .select("action, metadata, created_at")
      .eq("entity_type", "shipment")
      .eq("entity_id", id)
      .order("created_at", { ascending: false })
      .returns<AuditLogRow[]>(),
  ])

  if (shipmentError || itemsError || batchesError || auditError) {
    throw shipmentError ?? itemsError ?? batchesError ?? auditError
  }

  if (!shipment) {
    notFound()
  }

  const totalQuantity =
    shipmentItems?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0
  const totalAllocatedCost =
    shipmentItems?.reduce((sum, item) => sum + Number(item.allocated_cost), 0) ??
    0
  const estimatedLandedValue =
    shipmentItems?.reduce((sum, item) => {
      const purchasePriceBDT = Number(item.products?.purchase_price_bdt ?? 0)

      return (
        sum +
        Number(item.quantity) *
          (purchasePriceBDT + Number(item.landed_cost_per_unit))
      )
    }, 0) ?? 0

  const canManageShipment = session.profile.role === "admin"
  const canEditDraftShipment = canManageShipment && shipment.status === "draft"
  const canShowStatusActions =
    canManageShipment &&
    (shipment.status === "draft" || shipment.status === "sent")

  const quantityByProduct = new Map<string, number>()

  for (const item of shipmentItems ?? []) {
    quantityByProduct.set(item.product_id, Number(item.quantity))
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={shipment.shipment_code}
        description={`Inbound ${formatLabel(shipment.method)} shipment${shipment.carrier_name ? ` via ${shipment.carrier_name}` : ""}.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/shipments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shipments
              </Link>
            </Button>
            {canEditDraftShipment ? (
              <Button asChild>
                <Link href={`/shipments/${shipment.id}/edit`}>
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit Shipment
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className={getShipmentStatusClassName(shipment.status)}
              >
                {formatLabel(shipment.status)}
              </Badge>
              <Badge variant="outline">{formatLabel(shipment.method)}</Badge>
              {shipment.carrier_name ? (
                <Badge variant="outline">{shipment.carrier_name}</Badge>
              ) : null}
            </div>
            <p className="eyebrow-label">Shipment Profile</p>
            <CardTitle>Shipment Overview</CardTitle>
            <CardDescription>
              Financial and logistics profile for this inbound transfer.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="surface-panel-subtle rounded-[1.5rem] px-4 py-4">
              <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Shipping Cost
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight">
                {formatBDT(shipment.shipping_cost)}
              </p>
            </div>
            <div className="surface-panel-subtle rounded-[1.5rem] px-4 py-4">
              <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Customs Cost
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight">
                {formatBDT(shipment.customs_cost)}
              </p>
            </div>
            <div className="surface-panel-subtle rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
                  Sent
                </p>
              </div>
              <p className="mt-2 font-semibold tracking-tight">
                {formatDate(shipment.sent_date)}
              </p>
            </div>
            <div className="surface-panel-subtle rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
                  Expected Arrival
                </p>
              </div>
              <p className="mt-2 font-semibold tracking-tight">
                {formatDate(shipment.expected_arrival_date)}
              </p>
            </div>
            <div className="surface-panel-subtle rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
                  Received
                </p>
              </div>
              <p className="mt-2 font-semibold tracking-tight">
                {formatDate(shipment.received_date)}
              </p>
            </div>
            <div className="surface-panel-subtle rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
                  Created
                </p>
              </div>
              <p className="mt-2 font-semibold tracking-tight">
                {formatDate(shipment.created_at)}
              </p>
            </div>
            <div className="surface-panel-subtle md:col-span-2 rounded-[1.5rem] px-4 py-4">
              <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Notes
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {shipment.notes?.trim() || "No notes recorded for this shipment yet."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <p className="eyebrow-label">Controls</p>
            <CardTitle>Operational Controls</CardTitle>
            <CardDescription>
              Navigate the draft workflow and status transitions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="surface-panel-subtle flex items-center gap-3 rounded-[1.4rem] px-4 py-3">
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                <Plane className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">Current stage</p>
                <p className="text-sm text-muted-foreground">
                  {formatLabel(shipment.status)}
                </p>
              </div>
            </div>

            {canShowStatusActions ? (
              <div className="surface-panel-subtle rounded-[1.4rem] p-4">
                <p className="mb-3 text-sm font-medium">Available actions</p>
                <ShipmentStatusActions
                  shipmentId={shipment.id}
                  status={shipment.status}
                />
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
                {canManageShipment
                  ? "No direct status actions are available for this shipment stage."
                  : "Shipment status actions are reserved for admin users."}
              </div>
            )}

            <div className="surface-panel-subtle rounded-[1.4rem] p-4">
              <p className="text-sm font-medium">Cost allocation model</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Shipping and customs are distributed across item quantities and
                stored on each shipment line. Full landed value below combines
                that allocation with the product purchase cost when available.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Quantity"
          value={formatNumber(totalQuantity)}
          description="Units across all shipment items"
        />
        <MetricCard
          title="Shipping Cost"
          value={formatBDT(shipment.shipping_cost)}
          description="Header shipping cost"
        />
        <MetricCard
          title="Customs Cost"
          value={formatBDT(shipment.customs_cost)}
          description="Header customs cost"
        />
        <MetricCard
          title="Allocated Cost"
          value={formatBDT(totalAllocatedCost)}
          description="Summed line allocations"
        />
        <MetricCard
          title="Estimated Landed Value"
          value={formatBDT(estimatedLandedValue)}
          description="Purchase cost plus shipment allocation"
        />
      </section>

      <Card>
        <CardHeader>
          <p className="eyebrow-label">Shipment Manifest</p>
          <CardTitle>Shipment Items</CardTitle>
          <CardDescription>
            Per-product quantity and landed cost allocation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shipmentItems && shipmentItems.length > 0 ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
              <div className="overflow-x-auto">
                <Table className="min-w-[70rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">
                        Shipping Alloc.
                      </TableHead>
                      <TableHead className="text-right">
                        Customs Alloc.
                      </TableHead>
                      <TableHead className="text-right">
                        Shipment Cost / Unit
                      </TableHead>
                      <TableHead className="text-right">
                        Full Landed Cost / Unit
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipmentItems.map((item, index) => {
                      const purchasePriceBDT = Number(
                        item.products?.purchase_price_bdt ?? 0,
                      )
                      const fullLandedCostPerUnit =
                        purchasePriceBDT > 0
                          ? purchasePriceBDT + Number(item.landed_cost_per_unit)
                          : null

                      return (
                        <TableRow
                          key={`${item.product_id}-${index}`}
                        >
                          <TableCell className="font-medium">
                            {item.products?.name ?? "Unknown product"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.products?.sku ?? "Not available"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(item.quantity)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatBDT(item.allocated_shipping_cost)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatBDT(item.allocated_customs_cost)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatBDT(item.landed_cost_per_unit)}
                          </TableCell>
                          <TableCell className="text-right">
                            {fullLandedCostPerUnit === null
                              ? "Not available"
                              : formatBDT(fullLandedCostPerUnit)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No shipment items"
              description="Add products to this shipment to allocate transport costs."
            />
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <p className="eyebrow-label">FIFO Coverage</p>
            <CardTitle>FIFO Batch Coverage</CardTitle>
            <CardDescription>
              Inventory batches created from this shipment when stock is received.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryBatches && inventoryBatches.length > 0 ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
                <div className="overflow-x-auto">
                  <Table className="min-w-[42rem]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">
                          Original Qty
                        </TableHead>
                        <TableHead className="text-right">
                          Remaining Qty
                        </TableHead>
                        <TableHead className="text-right">
                          Landed Cost / Unit
                        </TableHead>
                        <TableHead>Received</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryBatches.map((batch) => {
                        const shipmentItem = shipmentItems?.find(
                          (item) => item.product_id === batch.product_id,
                        )
                        const originalQuantity =
                          batch.original_quantity ??
                          quantityByProduct.get(batch.product_id) ??
                          0

                        return (
                          <TableRow key={batch.id}>
                            <TableCell className="font-medium">
                              {shipmentItem?.products?.name ?? batch.product_id}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(originalQuantity)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(Number(batch.remaining_quantity ?? 0))}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatBDT(Number(batch.landed_cost_per_unit ?? 0))}
                            </TableCell>
                            <TableCell>
                              {formatDate(batch.received_at ?? shipment.received_date)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No FIFO batches yet"
                description="Batches appear here after a shipment is received into Bangladesh inventory."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow-label">Audit Trail</p>
            <CardTitle>Audit & Status History</CardTitle>
            <CardDescription>
              Shipment lifecycle events captured in the audit log.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditLogs && auditLogs.length > 0 ? (
              <div className="relative space-y-3 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[0.45rem] before:w-px before:bg-gradient-to-b before:from-border before:via-border/70 before:to-transparent">
                {auditLogs.map((entry, index) => {
                  const metadataEntries = getMetadataEntries(entry.metadata)

                  return (
                    <div
                      key={`${entry.created_at}-${index}`}
                      className="surface-panel-subtle relative rounded-[1.5rem] px-4 py-4 before:absolute before:top-5 before:-left-[1.52rem] before:h-3 before:w-3 before:rounded-full before:border before:border-primary/30 before:bg-primary/80 before:shadow-[0_0_0_6px_color-mix(in_oklab,var(--background)_72%,transparent)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                            <Boxes className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium tracking-[-0.02em]">
                              {formatLabel(entry.action)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(entry.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {metadataEntries.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {metadataEntries.map(([key, value]) => (
                            <Badge key={key} variant="outline">
                              {formatLabel(key)}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">
                          No additional metadata stored for this event.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title="No audit history"
                description="Shipment workflow events will appear here once actions are recorded."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
