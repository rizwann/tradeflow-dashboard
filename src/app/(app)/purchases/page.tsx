import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import {
  PurchaseTable,
  type PurchaseTableRow,
} from "@/features/purchases/purchase-table"

type PurchaseRecord = {
  id: string
  quantity: number
  unit_cost_eur: number
  exchange_rate: number
  total_cost_bdt: number
  purchase_date: string
  products: {
    name: string
  } | null
}

export default async function PurchasesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from("purchases")
    .select(
      "id, quantity, unit_cost_eur, exchange_rate, total_cost_bdt, purchase_date, products(name)",
    )
    .order("created_at", { ascending: false })
    .returns<PurchaseRecord[]>()

  const purchases: PurchaseTableRow[] =
    data?.map((purchase) => ({
      id: purchase.id,
      productName: purchase.products?.name ?? "Unknown",
      quantity: purchase.quantity,
      unitCostEur: purchase.unit_cost_eur,
      exchangeRate: purchase.exchange_rate,
      totalCostBdt: purchase.total_cost_bdt,
      purchaseDate: purchase.purchase_date,
    })) ?? []

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

      <PurchaseTable purchases={purchases} />
    </div>
  )
}
