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

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, status")
    .eq("id", shipmentId)
    .single()

  if (shipmentError || !shipment) {
    throw new Error("Shipment not found")
  }

  if (shipment.status !== "sent") {
    throw new Error("Only sent shipments can be marked as received")
  }

const { data: items, error: itemsError } = await supabase
  .from("shipment_items")
  .select(
    `
    id,
    product_id,
    quantity,
    allocated_shipping_cost,
    allocated_customs_cost,
    landed_cost_per_unit,
    products (
      purchase_price_bdt
    )
  `,
  )
  .eq("shipment_id", shipmentId)
  .returns<ShipmentItemForBatch[]>()

  if (itemsError || !items || items.length === 0) {
    throw new Error("Shipment has no items")
  }

  for (const item of items) {
    await moveInventory({
      supabase,
      productId: item.product_id,
      fromLocation: "in_transit",
      toLocation: "bangladesh",
      quantity: item.quantity,
      userId: user.id,
      reason: "shipment_received",
    })
  }
  const { data: existingBatches } = await supabase
    .from("inventory_batches")
    .select("id")
    .eq("shipment_id", shipmentId)
    .limit(1)

  if (existingBatches && existingBatches.length > 0) {
    throw new Error("Inventory batches already exist for this shipment")
  }
  const batches = items.map((item) => {
    const purchasePriceBDT = Number(item.products?.purchase_price_bdt ?? 0)

    const allocatedShippingCostPerUnit =
      Number(item.allocated_shipping_cost ?? 0) / item.quantity

    const allocatedCustomsCostPerUnit =
      Number(item.allocated_customs_cost ?? 0) / item.quantity

    const shipmentCostPerUnit = Number(item.landed_cost_per_unit ?? 0)

    const fullLandedCostPerUnit = purchasePriceBDT + shipmentCostPerUnit

    return {
      product_id: item.product_id,
      shipment_id: shipmentId,
      shipment_item_id: item.id,
      original_quantity: item.quantity,
      remaining_quantity: item.quantity,
      purchase_price_bdt: purchasePriceBDT,
      allocated_shipping_cost_per_unit: allocatedShippingCostPerUnit,
      allocated_customs_cost_per_unit: allocatedCustomsCostPerUnit,
      landed_cost_per_unit: fullLandedCostPerUnit,
      received_at: new Date().toISOString(),
    }
  })

  const { error: batchError } = await supabase
    .from("inventory_batches")
    .insert(batches)

  if (batchError) {
    throw new Error(batchError.message)
  }

  const { error: updateError } = await supabase
    .from("shipments")
    .update({
      status: "received",
      received_date: new Date().toISOString().slice(0, 10),
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
      from_status: "sent",
      to_status: "received",
    },
  })

  revalidatePath("/shipments")
  revalidatePath("/inventory")
}
