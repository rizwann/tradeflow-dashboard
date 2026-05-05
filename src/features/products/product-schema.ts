import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  brand: z.string().min(2, "Brand is required"),
  category: z.string().min(2, "Category is required"),
  sku: z.string().min(2, "SKU is required"),
  purchase_price_eur: z.coerce.number().min(0),
  exchange_rate: z.coerce.number().min(1),
  suggested_selling_price_bdt: z.coerce.number().min(0),
  image_url: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
})

export type ProductFormValues = z.input<typeof productSchema>
