import { z } from "zod"

export const purchaseSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().min(1),
  unit_cost_eur: z.coerce.number().min(0),
  exchange_rate: z.coerce.number().min(1),
  purchase_date: z.string(),
  notes: z.string().optional(),
})

export type PurchaseFormValues = z.infer<typeof purchaseSchema>
