import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function ShipmentsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("shipments")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Shipments</h1>

        <Button asChild>
          <Link href="/shipments/new">Create shipment</Link>
        </Button>
      </div>

      <div className="border rounded-xl p-4 bg-background">
        {data?.map((s) => (
          <div key={s.id} className="border-b py-2">
            {s.shipment_code} — {s.status}
          </div>
        ))}
      </div>
    </div>
  )
}
