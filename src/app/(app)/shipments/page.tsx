import Link from "next/link"
import { Plus } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { ShipmentStatusActions } from "@/features/shipments/shipment-status-actions"

type ShipmentsPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function ShipmentsPage({
  searchParams,
}: ShipmentsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data } = await supabase
    .from("shipments")
    .select(
      "id, shipment_code, method, status, shipping_cost, customs_cost, created_at",
    )
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipments"
        description="Manage shipment status and inventory movement from Germany to Bangladesh."
        actions={
          <Button asChild>
            <Link href="/shipments/new">
              <Plus className="mr-2 h-4 w-4" />
              Create shipment
            </Link>
          </Button>
        }
      />
      {params.error === "insufficient-stock" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Not enough Germany inventory to send this shipment. Please adjust the
          shipment quantity or record more purchases first.
        </div>
      ) : null}
      <div className="rounded-xl border bg-background p-4">
        {data?.length ? (
          <div className="space-y-3">
            {data.map((shipment) => (
              <div
                key={shipment.id}
                className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{shipment.shipment_code}</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.method} · {shipment.status} · Shipping ৳
                    {shipment.shipping_cost} · Customs ৳{shipment.customs_cost}
                  </p>
                </div>

                <ShipmentStatusActions
                  shipmentId={shipment.id}
                  status={shipment.status}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No shipments yet"
            description="Create your first shipment to start moving inventory."
            action={
              <Button asChild>
                <Link href="/shipments/new">Create shipment</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
