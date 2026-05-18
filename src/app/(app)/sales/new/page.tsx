import { createClient } from "@/lib/supabase/server"
import { SaleForm } from "@/features/sales/sale-form"

type ProductRow = {
  id: string
  name: string
  sku: string
  suggested_selling_price_bdt: number
}

type InventoryRow = {
  product_id: string
  location: "germany" | "in_transit" | "bangladesh"
  quantity: number
}

type CustomerRow = {
  id: string
  name: string
  phone: string
  city: string | null
}

export default async function NewSalePage() {
  const supabase = await createClient()

  const [{ data: products }, { data: inventory }, { data: customers }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, sku, suggested_selling_price_bdt")
        .order("name")
        .returns<ProductRow[]>(),
      supabase
        .from("inventory")
        .select("product_id, location, quantity")
        .eq("location", "bangladesh")
        .returns<InventoryRow[]>(),
      supabase
        .from("customers")
        .select("id, name, phone, city")
        .order("created_at", { ascending: false })
        .returns<CustomerRow[]>(),
    ])

  const bangladeshStockByProduct = new Map<string, number>()

  for (const row of inventory ?? []) {
    bangladeshStockByProduct.set(
      row.product_id,
      (bangladeshStockByProduct.get(row.product_id) ?? 0) + Number(row.quantity),
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record sale</h1>
        <p className="text-muted-foreground">
          Record a customer order with one or more Bangladesh-side sale lines.
        </p>
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <SaleForm
          products={(products ?? []).map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            suggested_selling_price_bdt: Number(
              product.suggested_selling_price_bdt,
            ),
            bangladeshStock: bangladeshStockByProduct.get(product.id) ?? 0,
          }))}
          customers={customers ?? []}
        />
      </div>
    </div>
  )
}
