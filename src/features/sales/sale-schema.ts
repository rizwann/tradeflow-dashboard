import { z } from "zod"

const optionalString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value === null ? undefined : value
    }

    const trimmedValue = value.trim()

    return trimmedValue.length === 0 ? undefined : trimmedValue
  },
  z.string().optional(),
)

export const saleSchema = z
  .object({
    product_id: z.string(),
    quantity: z.coerce.number().min(1),
    unit_selling_price_bdt: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
    sale_date: z.string().min(1, "Sale date is required"),
    customer_id: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.string().uuid("Select a valid customer").optional(),
    ),
    customer_name: optionalString,
    customer_phone: optionalString,
    customer_address: optionalString,
    customer_city: optionalString,
    payment_status: z.enum(["paid", "unpaid", "partial"]),
    notes: optionalString,
  })
  .superRefine((value, ctx) => {
    if (value.customer_id) {
      return
    }

    const hasNewCustomerIdentity =
      Boolean(value.customer_name) && Boolean(value.customer_phone)

    if (!hasNewCustomerIdentity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customer_id"],
        message: "Select an existing customer or create a new one",
      })
    }

    if (!value.customer_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customer_name"],
        message: "Customer name is required for a new customer",
      })
    }

    if (!value.customer_phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customer_phone"],
        message: "Customer phone is required for a new customer",
      })
    }
  })

export type SaleFormValues = z.infer<typeof saleSchema>
