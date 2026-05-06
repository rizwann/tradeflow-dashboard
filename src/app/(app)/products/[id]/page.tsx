import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  MapPin,
  Package,
  PencilLine,
  TrendingUp,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
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
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type ProductDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

type ProductRow = {
  id: string
  name: string
  brand: string
  category: string
  sku: string
  purchase_price_eur: number
  exchange_rate: number
  purchase_price_bdt: number
  suggested_selling_price_bdt: number
  image_url: string | null
  notes: string | null
  created_at: string | null
}

type InventoryRow = {
  location: "germany" | "in_transit" | "bangladesh"
  quantity: number
}

type SaleRow = {
  quantity: number
  unit_selling_price_bdt: number
  discount: number | null
}

type SaleBatchConsumptionRow = {
  quantity: number
  total_cost: number
  gross_profit: number
  sales: {
    status: "active" | "voided"
  } | null
}

type MovementRow = {
  from_location: "germany" | "in_transit" | "bangladesh" | null
  to_location: "germany" | "in_transit" | "bangladesh" | null
  quantity: number
  reason: string
  created_at: string
}

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function formatEUR(value: number) {
  return `€${Number(value).toFixed(2)}`
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

function formatLocation(value: MovementRow["from_location"]) {
  if (!value) return "External"

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getInventoryStatus(totalQuantity: number) {
  if (totalQuantity === 0) return "out"
  if (totalQuantity <= 5) return "low"

  return "healthy"
}

function getProductInitials(name: string, brand: string) {
  const source = `${brand} ${name}`.trim()
  const tokens = source.split(/\s+/).filter(Boolean).slice(0, 2)

  return tokens.map((token) => token.charAt(0).toUpperCase()).join("")
}

function getMovementLabel(movement: MovementRow) {
  const fromLocation = formatLocation(movement.from_location)
  const toLocation = formatLocation(movement.to_location)

  if (movement.from_location && movement.to_location) {
    return `${fromLocation} -> ${toLocation}`
  }

  if (!movement.from_location) {
    return `Inbound -> ${toLocation}`
  }

  if (!movement.to_location) {
    return `${fromLocation} -> Outbound`
  }

  return "Inventory movement"
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  await requireAdmin()

  const { id } = await params
  const supabase = await createClient()

  const [
    { data: product, error: productError },
    { data: inventoryRows, error: inventoryError },
    { data: salesRows, error: salesError },
    { data: consumptions, error: consumptionError },
    { data: movements, error: movementsError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, brand, category, sku, purchase_price_eur, exchange_rate, purchase_price_bdt, suggested_selling_price_bdt, image_url, notes, created_at",
      )
      .eq("id", id)
      .maybeSingle()
      .returns<ProductRow | null>(),
    supabase
      .from("inventory")
      .select("location, quantity")
      .eq("product_id", id)
      .returns<InventoryRow[]>(),
    supabase
      .from("sales")
      .select("quantity, unit_selling_price_bdt, discount")
      .eq("product_id", id)
      .eq("status", "active")
      .returns<SaleRow[]>(),
    supabase
      .from("sale_batch_consumptions")
      .select(
        `
        quantity,
        total_cost,
        gross_profit,
        sales!inner (
          status
        )
      `,
      )
      .eq("product_id", id)
      .eq("sales.status", "active")
      .returns<SaleBatchConsumptionRow[]>(),
    supabase
      .from("inventory_movements")
      .select("from_location, to_location, quantity, reason, created_at")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<MovementRow[]>(),
  ])

  if (productError || inventoryError || salesError || consumptionError || movementsError) {
    throw (
      productError ??
      inventoryError ??
      salesError ??
      consumptionError ??
      movementsError
    )
  }

  if (!product) {
    notFound()
  }

  const inventoryByLocation = {
    germany: 0,
    in_transit: 0,
    bangladesh: 0,
  }

  for (const row of inventoryRows ?? []) {
    inventoryByLocation[row.location] = Number(row.quantity)
  }

  const totalQuantity =
    inventoryByLocation.germany +
    inventoryByLocation.in_transit +
    inventoryByLocation.bangladesh

  const quantitySold =
    salesRows?.reduce((sum, row) => sum + Number(row.quantity), 0) ?? 0
  const revenue =
    salesRows?.reduce(
      (sum, row) =>
        sum +
        Number(row.quantity) * Number(row.unit_selling_price_bdt) -
        Number(row.discount ?? 0),
      0,
    ) ?? 0
  const fifoCost =
    consumptions?.reduce((sum, row) => sum + Number(row.total_cost), 0) ?? 0
  const grossProfit =
    consumptions?.reduce((sum, row) => sum + Number(row.gross_profit), 0) ?? 0

  const productInitials = getProductInitials(product.name, product.brand)
  const stockStatus = getInventoryStatus(totalQuantity)

  return (
    <div className="space-y-8">
      <PageHeader
        title={product.name}
        description={`${product.brand} · ${product.category} · SKU ${product.sku}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/products/${product.id}/edit`}>
                <PencilLine className="mr-2 h-4 w-4" />
                Edit Product
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="min-w-0">
          <CardContent className="px-0">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="px-5 pb-5 lg:border-r lg:border-border/60 lg:px-0 lg:pb-0">
                <div className="mx-5 overflow-hidden rounded-[1.75rem] border border-border/60 bg-muted/35">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={`${product.name} product image`}
                      className="h-[300px] w-full object-cover sm:h-[360px] lg:h-[420px]"
                    />
                  ) : (
                    <div className="relative flex h-[300px] items-end overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(135deg,_rgba(14,165,233,0.16),_rgba(59,130,246,0.08)_42%,_rgba(15,23,42,0.02))] p-6 sm:h-[360px] lg:h-[420px]">
                      <div
                        aria-hidden="true"
                        className="absolute right-6 top-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/20 text-foreground/90 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl"
                      >
                        <Package className="h-9 w-9" />
                      </div>
                      <div className="relative space-y-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/30 text-xl font-semibold tracking-[0.18em] shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
                          {productInitials}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-muted-foreground uppercase">
                            Catalog Preview
                          </p>
                          <p className="text-lg font-semibold tracking-tight">
                            {product.brand}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5 px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{product.brand}</Badge>
                  <Badge variant="outline">{product.category}</Badge>
                  <StatusBadge status={stockStatus} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/55 p-4">
                    <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Purchase Cost
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-tight">
                      {formatEUR(product.purchase_price_eur)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatBDT(product.purchase_price_bdt)} at rate{" "}
                      {product.exchange_rate.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/55 p-4">
                    <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Suggested Price
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-tight">
                      {formatBDT(product.suggested_selling_price_bdt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Created {formatDate(product.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/55 p-4">
                    <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      SKU
                    </p>
                    <p className="mt-2 font-semibold tracking-tight">
                      {product.sku}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/55 p-4">
                    <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Inventory Footprint
                    </p>
                    <p className="mt-2 font-semibold tracking-tight">
                      {formatNumber(totalQuantity)} units
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/60 bg-background/55 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Notes
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {product.notes?.trim() || "No notes recorded for this product yet."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Inventory Snapshot</CardTitle>
            <CardDescription>
              Live stock balance across Germany, transit, and Bangladesh.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="flex items-center justify-between rounded-[1.35rem] border border-border/60 bg-background/55 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Germany</p>
                  <p className="text-xs text-muted-foreground">
                    Ready stock
                  </p>
                </div>
              </div>
              <p className="text-lg font-semibold">
                {formatNumber(inventoryByLocation.germany)}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-[1.35rem] border border-border/60 bg-background/55 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-500/10 p-2 text-sky-600 dark:text-sky-300">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">In Transit</p>
                  <p className="text-xs text-muted-foreground">
                    On the move
                  </p>
                </div>
              </div>
              <p className="text-lg font-semibold">
                {formatNumber(inventoryByLocation.in_transit)}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-[1.35rem] border border-border/60 bg-background/55 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300">
                  <Boxes className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Bangladesh</p>
                  <p className="text-xs text-muted-foreground">
                    Sellable stock
                  </p>
                </div>
              </div>
              <p className="text-lg font-semibold">
                {formatNumber(inventoryByLocation.bangladesh)}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-[1.35rem] border border-border/60 bg-background/55 px-4 py-3">
              <div>
                <p className="font-medium">Total quantity</p>
                <p className="text-xs text-muted-foreground">
                  All locations combined
                </p>
              </div>
              <p className="text-lg font-semibold">
                {formatNumber(totalQuantity)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Quantity Sold"
          value={formatNumber(quantitySold)}
          description="Total active sales volume"
        />
        <MetricCard
          title="Revenue"
          value={formatBDT(revenue)}
          description="Net of recorded discounts"
        />
        <MetricCard
          title="FIFO Cost"
          value={formatBDT(fifoCost)}
          description="Consumed batch cost"
        />
        <MetricCard
          title="Gross Profit"
          value={formatBDT(grossProfit)}
          description="Revenue minus FIFO cost"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inventory Movements</CardTitle>
          <CardDescription>
            Latest stock activity recorded for this product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {movements && movements.length > 0 ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
              <div className="overflow-x-auto">
                <Table className="min-w-[40rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement, index) => (
                      <TableRow key={`${movement.created_at}-${index}`}>
                        <TableCell className="font-medium">
                          {getMovementLabel(movement)}
                        </TableCell>
                        <TableCell>{formatNumber(movement.quantity)}</TableCell>
                        <TableCell className="max-w-xs text-sm text-muted-foreground">
                          {movement.reason}
                        </TableCell>
                        <TableCell>{formatDate(movement.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No movements yet"
              description="Inventory moves will appear here after purchases, shipments, or adjustments."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
