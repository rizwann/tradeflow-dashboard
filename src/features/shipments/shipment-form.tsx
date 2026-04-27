"use client"

import { useState } from "react"
import { createShipment } from "./shipment-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Product = {
  id: string
  name: string
}

export function ShipmentForm({ products }: { products: Product[] }) {
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }])

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1 }])
  }

  return (
    <form action={createShipment} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Shipment code</Label>
          <Input name="shipment_code" required />
        </div>

        <div>
          <Label>Method</Label>
          <select name="method" className="w-full border rounded-md p-2">
            <option value="luggage">Luggage</option>
            <option value="courier">Courier</option>
            <option value="cargo">Cargo</option>
          </select>
        </div>

        <div>
          <Label>Shipping cost</Label>
          <Input
            name="shipping_cost"
            type="number"
            step="0.01"
            defaultValue={0}
          />
        </div>

        <div>
          <Label>Customs cost</Label>
          <Input
            name="customs_cost"
            type="number"
            step="0.01"
            defaultValue={0}
          />
        </div>
        <div>
          <Label>Carrier name</Label>
          <Input
            name="carrier_name"
            placeholder="DHL, luggage, cargo agent..."
          />
        </div>

        <div>
          <Label>Sent date</Label>
          <Input name="sent_date" type="date" />
        </div>

        <div>
          <Label>Expected arrival date</Label>
          <Input name="expected_arrival_date" type="date" />
        </div>
      </div>

      <div>
        <Label>Items</Label>

        {items.map((_, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 mt-2">
            <select name="product_id" className="border p-2">
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <Input name="quantity" type="number" defaultValue={1} />
          </div>
        ))}

        <Button type="button" onClick={addItem} className="mt-2">
          Add item
        </Button>
      </div>

      <Button type="submit">Create shipment</Button>
    </form>
  )
}
