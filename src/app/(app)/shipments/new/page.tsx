import { createClient } from "@/lib/supabase/server"
import { ShipmentForm } from "@/features/shipments/shipment-form"

export default async function NewShipmentPage() {
  const supabase = await createClient()

  const { data: products } = await supabase.from("products").select("id, name")

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create shipment</h1>

      <div className="border p-6 rounded-xl bg-background">
        <ShipmentForm products={products ?? []} />
      </div>
    </div>
  )
}
