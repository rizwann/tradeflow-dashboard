import { z } from "zod"

export const inventoryLocationSchema = z.enum([
  "germany",
  "in_transit",
  "bangladesh",
])

export const inventoryAdjustmentTypeSchema = z.enum([
  "increase",
  "decrease",
  "set",
])

export const inventoryAdjustmentSchema = z
  .object({
    product_id: z.string().min(1, "Product is required"),
    location: inventoryLocationSchema,
    adjustment_type: inventoryAdjustmentTypeSchema,
    quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
    reason: z.string().min(3, "Reason must be at least 3 characters"),
  })
  .superRefine((value, context) => {
    if (
      (value.adjustment_type === "increase" ||
        value.adjustment_type === "decrease") &&
      value.quantity <= 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Quantity must be greater than 0.",
      })
    }
  })

export type InventoryAdjustmentFormValues = z.infer<
  typeof inventoryAdjustmentSchema
>
