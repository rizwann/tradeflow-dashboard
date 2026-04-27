import Link from "next/link"
import { Plus } from "lucide-react"
import { ProductTable } from "@/features/products/product-table"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, brand, category, sku, purchase_price_eur, purchase_price_bdt, suggested_selling_price_bdt",
    )
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="rounded-xl border bg-background p-6">
        <h1 className="text-xl font-semibold">Could not load products</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage product catalog, pricing, SKUs, and categories.
          </p>
        </div>

        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <ProductTable products={products ?? []} />
    </div>
  )
}
