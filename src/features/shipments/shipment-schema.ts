import { z } from "zod"

const optionalString = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.string().optional(),
)

export const shipmentSchema = z.object({
  shipment_code: z.string().min(2, "Shipment code is required"),
  carrier_name: optionalString,
  method: z.enum(["luggage", "courier", "cargo"]),
  sent_date: optionalString,
  expected_arrival_date: optionalString,
  shipping_cost: z.coerce.number().min(0),
  customs_cost: z.coerce.number().min(0),
  notes: optionalString,
})

export const shipmentItemSchema = z.object({
  product_id: z.string().min(1, "Select a product"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
})

export const shipmentFormSchema = shipmentSchema.extend({
  items: z.array(shipmentItemSchema).min(1, "Add at least one shipment item"),
})

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>
