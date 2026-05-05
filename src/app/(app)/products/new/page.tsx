import { ProductForm } from "@/features/products/product-form"
import { requireAdmin } from "@/lib/auth"

export default async function NewProductPage() {
  await requireAdmin()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add product</h1>
        <p className="text-muted-foreground">
          Add a product to your import/resale catalog.
        </p>
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <ProductForm />
      </div>
    </div>
  )
}
