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

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(3, "Phone is required"),
  address: optionalString,
  city: optionalString,
  notes: optionalString,
})

export type CustomerFormValues = z.infer<typeof customerSchema>
