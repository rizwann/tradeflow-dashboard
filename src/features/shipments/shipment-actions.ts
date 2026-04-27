"use server"

import { createClient } from "@/lib/supabase/server"
import { shipmentSchema } from "./shipment-schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createShipment(formData: FormData) {
  const supabase = await createClient()

const raw = {
  shipment_code: formData.get("shipment_code"),
  carrier_name: formData.get("carrier_name"),
  method: formData.get("method"),
  sent_date: formData.get("sent_date"),
  expected_arrival_date: formData.get("expected_arrival_date"),
  shipping_cost: formData.get("shipping_cost") || "0",
  customs_cost: formData.get("customs_cost") || "0",
  notes: formData.get("notes"),
}

  const parsed = shipmentSchema.safeParse(raw)

if (!parsed.success) {
  console.log(parsed.error.flatten());
  throw new Error("Invalid shipment");
}

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // create shipment
  const { data: shipment, error } = await supabase
    .from("shipments")
    .insert({
      ...parsed.data,
      status: "draft",
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  // handle items (dynamic)
  const productIds = formData.getAll("product_id")
  const quantities = formData.getAll("quantity")

  const items = productIds.map((id, index) => ({
    shipment_id: shipment.id,
    product_id: id,
    quantity: Number(quantities[index]),
  }))

  await supabase.from("shipment_items").insert(items)

  await supabase.from("audit_logs").insert({
    action: "shipment_created",
    entity_type: "shipment",
    entity_id: shipment.id,
    user_id: user?.id,
  })

  revalidatePath("/shipments")
  redirect("/shipments")
}
