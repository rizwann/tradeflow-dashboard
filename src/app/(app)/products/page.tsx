import Link from "next/link"
import { Plus } from "lucide-react"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { ProductRow, ProductTable } from "@/features/products/product-table"
import { ProductsExportButton } from "@/features/products/products-export-button"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export const metadata = {
  title: "Products",
}

type ProductExportRow = {
  id: string
  name: string
  brand: string
  category: string
  sku: string
  purchase_price_eur: number
  exchange_rate: number
  purchase_price_bdt: number
  suggested_selling_price_bdt: number
  created_at: string | null
}

export default async function ProductsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, brand, category, sku, purchase_price_eur, exchange_rate, purchase_price_bdt, suggested_selling_price_bdt, created_at",
    )
    .order("created_at", { ascending: false })
    .returns<ProductExportRow[]>()

  if (error) {
    return (
      <ErrorState title="Could not load products" message={error.message} />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage product catalog, pricing, SKUs, and categories."
        actions={
          <>
            <ProductsExportButton rows={products ?? []} />
            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add product
              </Link>
            </Button>
          </>
        }
      />

      <ProductTable products={(products ?? []) as ProductRow[]} />
    </div>
  )
}
