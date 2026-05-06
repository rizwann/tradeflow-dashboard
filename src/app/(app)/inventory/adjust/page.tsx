import { PageHeader } from "@/components/shared/page-header"
import { InventoryAdjustmentForm } from "@/features/inventory/inventory-adjustment-form"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type ProductRecord = {
  id: string
  name: string
  sku: string
}

export default async function AdjustInventoryPage() {
  const session = await requireRole(["admin", "partner"])
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku")
    .order("name", { ascending: true })
    .returns<ProductRecord[]>()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Adjust inventory"
        description="Correct stock counts with an auditable inventory adjustment."
      />

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <InventoryAdjustmentForm
          products={products ?? []}
          currentUserRole={session.profile.role}
        />
      </div>
    </div>
  )
}
