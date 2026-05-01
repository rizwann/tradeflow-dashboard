"use server"

import { createClient } from "@/lib/supabase/server"
import { shipmentSchema } from "./shipment-schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { moveInventory } from "@/lib/inventory"

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
    console.log(parsed.error.flatten())
    throw new Error("Invalid shipment")
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

  const totalQuantity = quantities.reduce((sum, quantity) => {
    return sum + Number(quantity)
  }, 0)

  if (totalQuantity <= 0) {
    throw new Error("Shipment must have at least one valid item quantity")
  }

  const totalShippingCost = parsed.data.shipping_cost
  const totalCustomsCost = parsed.data.customs_cost

  const items = productIds.map((id, index) => {
    const quantity = Number(quantities[index])
    const quantityRatio = quantity / totalQuantity

    const allocatedShippingCost = totalShippingCost * quantityRatio
    const allocatedCustomsCost = totalCustomsCost * quantityRatio
    const allocatedTotalCost = allocatedShippingCost + allocatedCustomsCost

    return {
      shipment_id: shipment.id,
      product_id: String(id),
      quantity,
      allocated_cost: allocatedTotalCost,
      allocated_shipping_cost: allocatedShippingCost,
      allocated_customs_cost: allocatedCustomsCost,
      landed_cost_per_unit: allocatedTotalCost / quantity,
    }
  })

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
export async function markShipmentAsSent(shipmentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Only admin can send shipments")
  }

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, status")
    .eq("id", shipmentId)
    .single()

  if (shipmentError || !shipment) {
    throw new Error("Shipment not found")
  }

  if (shipment.status !== "draft") {
    throw new Error("Only draft shipments can be marked as sent")
  }

  const { data: items, error: itemsError } = await supabase
    .from("shipment_items")
    .select("product_id, quantity")
    .eq("shipment_id", shipmentId)

  if (itemsError || !items || items.length === 0) {
    throw new Error("Shipment has no items")
  }

  try {
    for (const item of items) {
      await moveInventory({
        supabase,
        productId: item.product_id,
        fromLocation: "germany",
        toLocation: "in_transit",
        quantity: item.quantity,
        userId: user.id,
        reason: "shipment_sent",
      })
    }
  } catch {
    redirect("/shipments?error=insufficient-stock")
  }

  const { error: updateError } = await supabase
    .from("shipments")
    .update({
      status: "sent",
      sent_date: new Date().toISOString().slice(0, 10),
    })
    .eq("id", shipmentId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  await supabase.from("audit_logs").insert({
    action: "shipment_status_changed",
    entity_type: "shipment",
    entity_id: shipmentId,
    user_id: user.id,
    metadata: {
      from_status: "draft",
      to_status: "sent",
    },
  })

  revalidatePath("/shipments")
}

type ShipmentItemForBatch = {
  id: string
  product_id: string
  quantity: number
  allocated_shipping_cost: number
  allocated_customs_cost: number
  landed_cost_per_unit: number
  products: {
    purchase_price_bdt: number
  } | null
}

export async function markShipmentAsReceived(shipmentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.rpc("receive_shipment_with_batches", {
    p_shipment_id: shipmentId,
    p_user_id: user.id,
  })

  if (error) {
    const message = error.message.toLowerCase()

    if (message.includes("shipment not found")) {
      redirect("/shipments?error=shipment-not-found")
    }

    if (message.includes("only sent shipments")) {
      redirect("/shipments?error=invalid-shipment-status")
    }

    if (message.includes("inventory batches already exist")) {
      redirect("/shipments?error=duplicate-batches")
    }

    if (message.includes("not enough in-transit inventory")) {
      redirect("/shipments?error=insufficient-transit-stock")
    }

    throw new Error(error.message)
  }

  revalidatePath("/shipments")
  revalidatePath("/inventory")
  revalidatePath("/reports")
  revalidatePath("/dashboard")
  redirect("/shipments")
}
