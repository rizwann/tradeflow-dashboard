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

export const deliveryStatusSchema = z.enum([
  "pending",
  "shipped",
  "delivered",
  "cancelled",
])

export const deliveryCostPaidBySchema = z.enum(["business", "customer"])

export const deliverySchema = z
  .object({
    sale_id: z.string().uuid("Sale ID is required"),
    customer_id: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.string().uuid("Customer ID must be valid").optional(),
    ),
    status: deliveryStatusSchema,
    delivery_method: optionalString,
    tracking_number: optionalString,
    delivery_cost: z.coerce
      .number()
      .min(0, "Delivery cost cannot be negative"),
    delivery_cost_paid_by: deliveryCostPaidBySchema,
    shipped_at: optionalString,
    delivered_at: optionalString,
    notes: optionalString,
  })
  .superRefine((value, ctx) => {
    if (value.delivered_at && value.status !== "delivered") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["delivered_at"],
        message: "Delivered time can only be set when status is delivered",
      })
    }

    if (
      value.shipped_at &&
      value.status !== "shipped" &&
      value.status !== "delivered"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shipped_at"],
        message: "Shipped time can only be set when status is shipped or delivered",
      })
    }
  })

export type DeliveryFormValues = z.infer<typeof deliverySchema>
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>
export type DeliveryCostPaidBy = z.infer<typeof deliveryCostPaidBySchema>
