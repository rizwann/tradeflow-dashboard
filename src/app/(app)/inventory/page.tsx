import { ErrorState } from "@/components/shared/error-state"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { InventoryTable } from "@/features/inventory/inventory-table"

type ProductRow = {
  id: string
  name: string
  sku: string
}

type InventoryRecord = {
  product_id: string
  location: "germany" | "in_transit" | "bangladesh"
  quantity: number
}

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, sku")
    .order("name")

  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select("product_id, location, quantity")

  if (productsError || inventoryError) {
    return <ErrorState title="Could not load inventory" />
  }

  const inventoryRecords = (inventory ?? []) as InventoryRecord[]

  const rows =
    ((products ?? []) as ProductRow[]).map((product) => {
      const germany =
        inventoryRecords.find(
          (item) =>
            item.product_id === product.id && item.location === "germany",
        )?.quantity ?? 0

      const inTransit =
        inventoryRecords.find(
          (item) =>
            item.product_id === product.id && item.location === "in_transit",
        )?.quantity ?? 0

      const bangladesh =
        inventoryRecords.find(
          (item) =>
            item.product_id === product.id && item.location === "bangladesh",
        )?.quantity ?? 0

      const total = germany + inTransit + bangladesh

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        germany,
        inTransit,
        bangladesh,
        total,
      }
    }) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock across Germany, in transit, and Bangladesh."
      />

      <InventoryTable rows={rows} />
    </div>
  )
}
