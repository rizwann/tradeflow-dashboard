import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

type PurchaseRow = {
  id: string
  quantity: number
  total_cost_bdt: number
  purchase_date: string
  products: {
    name: string
  } | null
}

export default async function PurchasesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("purchases")
    .select("id, quantity, total_cost_bdt, purchase_date, products(name)")
    .order("created_at", { ascending: false })
    .returns<PurchaseRow[]>()
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        description="Track purchase orders, quantities, and supplier costs."
        actions={
          <Button asChild>
            <Link href="/purchases/new">
              <Plus className="mr-2 h-4 w-4" />
              Add purchase
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border bg-background p-4">
        {data?.map((p) => {
          const productName = p.products?.name ?? "Unknown"

          return (
            <div key={p.id} className="border-b py-2">
              {productName} — {p.quantity} pcs — ৳{p.total_cost_bdt}
            </div>
          )
        })}
      </div>
    </div>
  )
}
