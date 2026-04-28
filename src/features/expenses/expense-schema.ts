import { z } from "zod"

const optionalString = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().optional(),
)

export const expenseSchema = z.object({
  type: z.enum([
    "shipping",
    "customs",
    "packaging",
    "marketing",
    "delivery",
    "other",
  ]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1).default("BDT"),
  date: z.string().min(1, "Date is required"),
  shipment_id: optionalString,
  notes: optionalString,
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
