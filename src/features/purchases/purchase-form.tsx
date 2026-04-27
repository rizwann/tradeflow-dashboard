import { createPurchase } from "./purchase-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Product = {
  id: string
  name: string
}

export function PurchaseForm({ products }: { products: Product[] }) {
  return (
    <form action={createPurchase} className="space-y-6">
      <div className="space-y-2">
        <Label>Product</Label>
        <select name="product_id" className="w-full rounded-md border p-2">
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Quantity</Label>
          <Input name="quantity" type="number" required />
        </div>

        <div>
          <Label>Unit cost EUR</Label>
          <Input name="unit_cost_eur" type="number" step="0.01" required />
        </div>

        <div>
          <Label>Exchange rate</Label>
          <Input name="exchange_rate" type="number" step="0.01" required />
        </div>

        <div>
          <Label>Purchase date</Label>
          <Input name="purchase_date" type="date" required />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Input name="notes" />
      </div>

      <Button type="submit">Record purchase</Button>
    </form>
  )
}
