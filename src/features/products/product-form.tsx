import { createProduct } from "./product-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProductForm() {
  return (
    <form action={createProduct} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Isana Shower Gel"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" placeholder="Isana" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            placeholder="Personal care"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" placeholder="ISANA-SG-001" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_price_eur">Purchase price EUR</Label>
          <Input
            id="purchase_price_eur"
            name="purchase_price_eur"
            type="number"
            step="0.01"
            placeholder="1.49"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exchange_rate">Exchange rate</Label>
          <Input
            id="exchange_rate"
            name="exchange_rate"
            type="number"
            step="0.01"
            placeholder="130"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="suggested_selling_price_bdt">
            Suggested selling price BDT
          </Label>
          <Input
            id="suggested_selling_price_bdt"
            name="suggested_selling_price_bdt"
            type="number"
            step="0.01"
            placeholder="350"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" placeholder="https://..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Optional notes" />
      </div>

      <Button type="submit">Save product</Button>
    </form>
  )
}
