import { createClient } from "@/lib/supabase/server"
import { PurchaseForm } from "@/features/purchases/purchase-form"

export default async function NewPurchasePage() {
  const supabase = await createClient()

  const { data: products } = await supabase.from("products").select("id, name")

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Record purchase</h1>

      <div className="rounded-xl border bg-background p-6">
        <PurchaseForm products={products ?? []} />
      </div>
    </div>
  )
}
