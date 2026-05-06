import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { ShipmentsExportButton } from "@/features/shipments/shipments-export-button"
import {
  ShipmentTable,
  type ShipmentStatus,
  type ShipmentTableRow,
} from "@/features/shipments/shipment-table"
import { getCurrentUserProfile } from "@/lib/auth"

type ShipmentsPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

type ShipmentRecord = {
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

export default async function ShipmentsPage({
  searchParams,
}: ShipmentsPageProps) {
  const params = await searchParams
  const session = await getCurrentUserProfile()
  const supabase = await createClient()

  const { data } = await supabase
    .from("shipments")
    .select(
      "id, shipment_code, carrier_name, method, status, sent_date, expected_arrival_date, received_date, shipping_cost, customs_cost, notes, created_at",
    )
    .order("created_at", { ascending: false })
    .returns<ShipmentRecord[]>()

  const shipments: ShipmentTableRow[] =
    data?.map((shipment) => ({
      id: shipment.id,
      shipmentCode: shipment.shipment_code,
      method: shipment.method,
      status: shipment.status,
      shippingCost: shipment.shipping_cost,
      customsCost: shipment.customs_cost,
      createdDate: shipment.created_at,
    })) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipments"
        description="Manage shipment status and inventory movement from Germany to Bangladesh."
        actions={
          <>
            <ShipmentsExportButton rows={data ?? []} />
            <Button asChild>
              <Link href="/shipments/new">
                <Plus className="mr-2 h-4 w-4" />
                Create shipment
              </Link>
            </Button>
          </>
        }
      />
      {params.error === "insufficient-stock" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Not enough Germany inventory to send this shipment. Please adjust the
          shipment quantity or record more purchases first.
        </div>
      ) : null}
      {params.error === "shipment-not-found" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Shipment could not be found.
        </div>
      ) : null}

      {params.error === "invalid-shipment-status" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Only sent shipments can be marked as received.
        </div>
      ) : null}

      {params.error === "duplicate-batches" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          FIFO inventory batches already exist for this shipment.
        </div>
      ) : null}

      {params.error === "insufficient-transit-stock" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Not enough in-transit inventory to receive this shipment.
        </div>
      ) : null}
      {params.error === "invalid-send-status" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Only draft shipments can be marked as sent.
        </div>
      ) : null}

      {params.error === "no-shipment-items" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          This shipment has no items. Add shipment items before sending.
        </div>
      ) : null}

      <ShipmentTable
        shipments={shipments}
        currentUserRole={session.profile.role}
      />
    </div>
  )
}
