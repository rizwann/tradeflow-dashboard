import { z } from "zod"

export const saleSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().min(1),
  unit_selling_price_bdt: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  sale_date: z.string().min(1, "Sale date is required"),
  customer_name: z.string().optional(),
  payment_status: z.enum(["paid", "unpaid", "partial"]),
  notes: z.string().optional(),
})

export type SaleFormValues = z.infer<typeof saleSchema>
