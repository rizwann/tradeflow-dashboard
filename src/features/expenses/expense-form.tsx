import { createExpense } from "./expense-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ShipmentOption = {
  id: string
  shipment_code: string
}

type ExpenseFormProps = {
  shipments: ShipmentOption[]
}

export function ExpenseForm({ shipments }: ExpenseFormProps) {
  return (
    <form action={createExpense} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Expense type</Label>
          <select
            name="type"
            required
            className="w-full rounded-md border bg-background p-2 text-sm"
          >
            <option value="shipping">Shipping</option>
            <option value="customs">Customs</option>
            <option value="packaging">Packaging</option>
            <option value="marketing">Marketing</option>
            <option value="delivery">Delivery</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input name="amount" type="number" step="0.01" min={0} required />
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <select
            name="currency"
            defaultValue="BDT"
            className="w-full rounded-md border bg-background p-2 text-sm"
          >
            <option value="BDT">BDT</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Input name="date" type="date" required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Related shipment</Label>
          <select
            name="shipment_id"
            className="w-full rounded-md border bg-background p-2 text-sm"
            defaultValue=""
          >
            <option value="">No shipment</option>
            {shipments.map((shipment) => (
              <option key={shipment.id} value={shipment.id}>
                {shipment.shipment_code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input name="notes" placeholder="Optional notes" />
      </div>

      <Button type="submit">Add expense</Button>
    </form>
  )
}
