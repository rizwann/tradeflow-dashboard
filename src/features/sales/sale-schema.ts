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

const saleItemSchema = z
  .object({
    product_id: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().gt(0, "Quantity must be greater than 0"),
    unit_selling_price_bdt: z.coerce
      .number()
      .min(0, "Unit selling price must be 0 or more"),
    discount: z.coerce.number().min(0, "Discount must be 0 or more").default(0),
  })
  .superRefine((value, ctx) => {
    const lineRevenue =
      Number(value.quantity) * Number(value.unit_selling_price_bdt) -
      Number(value.discount ?? 0)

    if (lineRevenue < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discount"],
        message: "Discount cannot make line revenue negative",
      })
    }
  })

export const saleSchema = z
  .object({
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
    items: z.array(saleItemSchema).min(1, "Add at least one product"),
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
