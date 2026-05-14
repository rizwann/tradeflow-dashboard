import { createClient } from "@/lib/supabase/server"
import { SaleForm } from "@/features/sales/sale-form"

export default async function NewSalePage() {
  const supabase = await createClient()

  const [{ data: products }, { data: customers }] = await Promise.all([
    supabase.from("products").select("id, name").order("name"),
    supabase
      .from("customers")
      .select("id, name, phone, city")
      .order("created_at", { ascending: false }),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record sale</h1>
        <p className="text-muted-foreground">
          Record Bangladesh-side sales and update local inventory.
        </p>
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <SaleForm products={products ?? []} customers={customers ?? []} />
      </div>
    </div>
  )
}
