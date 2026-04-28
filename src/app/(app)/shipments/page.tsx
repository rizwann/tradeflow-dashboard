import Link from "next/link"
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">
            Manage shipment status and inventory movement from Germany to
            Bangladesh.
          </p>
        </div>

        <Button asChild>
          <Link href="/shipments/new">Create shipment</Link>
        </Button>
      </div>
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
          <div className="py-10 text-center">
            <h2 className="font-semibold">No shipments yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first shipment to start moving inventory.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
