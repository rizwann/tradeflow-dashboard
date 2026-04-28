import { createSale } from "./sale-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Product = {
  id: string
  name: string
}

export function SaleForm({ products }: { products: Product[] }) {
  return (
    <form action={createSale} className="space-y-6">
      <div className="space-y-2">
        <Label>Product</Label>
        <select
          name="product_id"
          required
          className="w-full rounded-md border bg-background p-2 text-sm"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Quantity sold</Label>
          <Input name="quantity" type="number" min={1} required />
        </div>

        <div className="space-y-2">
          <Label>Unit selling price BDT</Label>
          <Input
            name="unit_selling_price_bdt"
            type="number"
            step="0.01"
            min={0}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Discount</Label>
          <Input
            name="discount"
            type="number"
            step="0.01"
            min={0}
            defaultValue={0}
          />
        </div>

        <div className="space-y-2">
          <Label>Sale date</Label>
          <Input name="sale_date" type="date" required />
        </div>

        <div className="space-y-2">
          <Label>Payment status</Label>
          <select
            name="payment_status"
            defaultValue="paid"
            className="w-full rounded-md border bg-background p-2 text-sm"
          >
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Customer name</Label>
          <Input name="customer_name" placeholder="Optional" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input name="notes" placeholder="Optional notes" />
      </div>

      <Button type="submit">Record sale</Button>
    </form>
  )
}
