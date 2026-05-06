import { notFound, redirect } from "next/navigation"

import { ShipmentForm } from "@/features/shipments/shipment-form"
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type EditShipmentPageProps = {
  params: Promise<{
    id: string
  }>
}

type ShipmentRecord = {
  id: string
  shipment_code: string
  carrier_name: string | null
  method: "luggage" | "courier" | "cargo"
  status: "draft" | "sent" | "in_transit" | "received" | "lost_damaged"
  sent_date: string | null
  expected_arrival_date: string | null
  shipping_cost: number
  customs_cost: number
  notes: string | null
}

type ShipmentItemRecord = {
  product_id: string
  quantity: number
}

type ProductRecord = {
  id: string
  name: string
}

export default async function EditShipmentPage({
  params,
}: EditShipmentPageProps) {
  await requireAdmin()

  const { id } = await params
  const supabase = await createClient()

  const [
    { data: shipment, error: shipmentError },
    { data: shipmentItems, error: shipmentItemsError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase
      .from("shipments")
      .select(
        "id, shipment_code, carrier_name, method, status, sent_date, expected_arrival_date, shipping_cost, customs_cost, notes",
      )
      .eq("id", id)
      .maybeSingle()
      .returns<ShipmentRecord | null>(),
    supabase
      .from("shipment_items")
      .select("product_id, quantity")
      .eq("shipment_id", id)
      .returns<ShipmentItemRecord[]>(),
    supabase
      .from("products")
      .select("id, name")
      .order("name", { ascending: true })
      .returns<ProductRecord[]>(),
  ])

  if (shipmentError || shipmentItemsError || productsError) {
    throw shipmentError ?? shipmentItemsError ?? productsError
  }

  if (!shipment) {
    notFound()
  }

  if (shipment.status !== "draft") {
    redirect("/shipments")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit shipment</h1>
        <p className="text-muted-foreground">
          Update draft shipment details and product quantities before sending.
        </p>
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <ShipmentForm
          mode="edit"
          products={products ?? []}
          shipment={{
            ...shipment,
            items:
              shipmentItems?.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
              })) ?? [],
          }}
        />
      </div>
    </div>
  )
}
