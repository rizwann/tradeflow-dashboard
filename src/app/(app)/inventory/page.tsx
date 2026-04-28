import { createClient } from "@/lib/supabase/server"
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
    return (
      <div className="rounded-xl border bg-background p-6">
        <h1 className="text-xl font-semibold">Could not load inventory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh the page or try again later.
        </p>
      </div>
    )
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Track stock across Germany, in transit, and Bangladesh.
        </p>
      </div>

      <InventoryTable rows={rows} />
    </div>
  )
}
