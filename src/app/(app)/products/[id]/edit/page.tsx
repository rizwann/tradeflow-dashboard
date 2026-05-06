import { notFound } from "next/navigation"

import { ProductForm } from "@/features/products/product-form"
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type EditProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin()

  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, brand, category, sku, purchase_price_eur, exchange_rate, suggested_selling_price_bdt, image_url, notes",
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit product</h1>
        <p className="text-muted-foreground">
          Update product catalog and pricing details.
        </p>
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <ProductForm mode="edit" product={product} />
      </div>
    </div>
  )
}
