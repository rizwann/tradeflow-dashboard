"use server"

import { createClient } from "@/lib/supabase/server"
import { shipmentFormSchema } from "./shipment-schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"

export type ShipmentActionState = {
  success: boolean
  message: string
}

function parseShipmentFormData(formData: FormData) {
  const itemKeys = Array.from(formData.keys()).filter((key) =>
    key.startsWith("items."),
  )
  const itemIndexes = Array.from(
    new Set(
      itemKeys
        .map((key) => key.match(/^items\.(\d+)\./)?.[1])
        .filter((index): index is string => index !== undefined),
    ),
  ).sort((left, right) => Number(left) - Number(right))

  const raw = {
    shipment_code: formData.get("shipment_code"),
    carrier_name: formData.get("carrier_name"),
    method: formData.get("method"),
    sent_date: formData.get("sent_date"),
    expected_arrival_date: formData.get("expected_arrival_date"),
    shipping_cost: formData.get("shipping_cost") || "0",
    customs_cost: formData.get("customs_cost") || "0",
    notes: formData.get("notes"),
    items: itemIndexes.map((index) => ({
      product_id: formData.get(`items.${index}.product_id`),
      quantity: formData.get(`items.${index}.quantity`),
    })),
  }

  return shipmentFormSchema.safeParse(raw)
}

function buildShipmentItems(
  shipmentId: string,
  items: Array<{ product_id: string; quantity: number }>,
  shippingCost: number,
  customsCost: number,
) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  if (totalQuantity <= 0) {
    return {
      success: false as const,
      message: "Shipment must have at least one valid item quantity.",
    }
  }

  return {
    success: true as const,
    items: items.map((item) => {
      const quantityRatio = item.quantity / totalQuantity
      const allocatedShippingCost = shippingCost * quantityRatio
      const allocatedCustomsCost = customsCost * quantityRatio
      const allocatedTotalCost = allocatedShippingCost + allocatedCustomsCost

      return {
        shipment_id: shipmentId,
        product_id: item.product_id,
        quantity: item.quantity,
        allocated_cost: allocatedTotalCost,
        allocated_shipping_cost: allocatedShippingCost,
        allocated_customs_cost: allocatedCustomsCost,
        landed_cost_per_unit: allocatedTotalCost / item.quantity,
      }
    }),
  }
}

export async function createShipment(
  _prevState: ShipmentActionState,
  formData: FormData,
): Promise<ShipmentActionState> {
  try {
    const supabase = await createClient()
    const parsed = parseShipmentFormData(formData)

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the shipment form and try again.",
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // create shipment
    const { data: shipment, error } = await supabase
      .from("shipments")
      .insert({
        shipment_code: parsed.data.shipment_code,
        carrier_name: parsed.data.carrier_name,
        method: parsed.data.method,
        sent_date: parsed.data.sent_date,
        expected_arrival_date: parsed.data.expected_arrival_date,
        shipping_cost: parsed.data.shipping_cost,
        customs_cost: parsed.data.customs_cost,
        notes: parsed.data.notes,
        status: "draft",
      })
      .select("id")
      .single()

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    const builtItems = buildShipmentItems(
      shipment.id,
      parsed.data.items,
      parsed.data.shipping_cost,
      parsed.data.customs_cost,
    )

    if (!builtItems.success) {
      return {
        success: false,
        message: builtItems.message,
      }
    }

    const { error: shipmentItemsError } = await supabase
      .from("shipment_items")
      .insert(builtItems.items)

    if (shipmentItemsError) {
      return {
        success: false,
        message: shipmentItemsError.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "shipment_created",
      entity_type: "shipment",
      entity_id: shipment.id,
      user_id: user?.id,
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidatePath("/shipments")

    return {
      success: true,
      message: "Shipment created successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create shipment.",
    }
  }
}

export async function updateShipment(
  _prevState: ShipmentActionState,
  formData: FormData,
): Promise<ShipmentActionState> {
  try {
    const { user } = await requireAdmin()
    const supabase = await createClient()
    const shipmentId = formData.get("id")

    if (typeof shipmentId !== "string" || shipmentId.length === 0) {
      return {
        success: false,
        message: "Shipment ID is required.",
      }
    }

    const parsed = parseShipmentFormData(formData)

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the shipment form and try again.",
      }
    }

    const { data: existingShipment, error: existingShipmentError } =
      await supabase
        .from("shipments")
        .select("id, shipment_code, status")
        .eq("id", shipmentId)
        .maybeSingle()

    if (existingShipmentError) {
      return {
        success: false,
        message: existingShipmentError.message,
      }
    }

    if (!existingShipment) {
      return {
        success: false,
        message: "Shipment not found.",
      }
    }

    if (existingShipment.status !== "draft") {
      return {
        success: false,
        message: "Only draft shipments can be edited.",
      }
    }

    const builtItems = buildShipmentItems(
      shipmentId,
      parsed.data.items,
      parsed.data.shipping_cost,
      parsed.data.customs_cost,
    )

    if (!builtItems.success) {
      return {
        success: false,
        message: builtItems.message,
      }
    }

    const { error: updateError } = await supabase
      .from("shipments")
      .update({
        shipment_code: parsed.data.shipment_code,
        carrier_name: parsed.data.carrier_name,
        method: parsed.data.method,
        expected_arrival_date: parsed.data.expected_arrival_date,
        shipping_cost: parsed.data.shipping_cost,
        customs_cost: parsed.data.customs_cost,
        notes: parsed.data.notes,
      })
      .eq("id", shipmentId)

    if (updateError) {
      return {
        success: false,
        message: updateError.message,
      }
    }

    const { error: deleteItemsError } = await supabase
      .from("shipment_items")
      .delete()
      .eq("shipment_id", shipmentId)

    if (deleteItemsError) {
      return {
        success: false,
        message: deleteItemsError.message,
      }
    }

    const { error: insertItemsError } = await supabase
      .from("shipment_items")
      .insert(builtItems.items)

    if (insertItemsError) {
      return {
        success: false,
        message: insertItemsError.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "shipment_updated",
      entity_type: "shipment",
      entity_id: shipmentId,
      user_id: user.id,
      metadata: {
        shipment_code: parsed.data.shipment_code,
        item_count: parsed.data.items.length,
      },
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidatePath("/shipments")
    revalidatePath("/reports")

    return {
      success: true,
      message: "Shipment updated successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update shipment.",
    }
  }
}

export async function deleteShipment(
  shipmentId: string,
): Promise<ShipmentActionState> {
  try {
    const { user } = await requireAdmin()
    const supabase = await createClient()

    if (!shipmentId) {
      return {
        success: false,
        message: "Shipment ID is required.",
      }
    }

    const { data: existingShipment, error: existingShipmentError } =
      await supabase
        .from("shipments")
        .select("id, shipment_code, status")
        .eq("id", shipmentId)
        .maybeSingle()

    if (existingShipmentError) {
      return {
        success: false,
        message: existingShipmentError.message,
      }
    }

    if (!existingShipment) {
      return {
        success: false,
        message: "Shipment not found.",
      }
    }

    if (existingShipment.status !== "draft") {
      return {
        success: false,
        message: "Only draft shipments can be deleted.",
      }
    }

    const { error: deleteItemsError } = await supabase
      .from("shipment_items")
      .delete()
      .eq("shipment_id", shipmentId)

    if (deleteItemsError) {
      return {
        success: false,
        message: deleteItemsError.message,
      }
    }

    const { error: deleteShipmentError } = await supabase
      .from("shipments")
      .delete()
      .eq("id", shipmentId)

    if (deleteShipmentError) {
      return {
        success: false,
        message: deleteShipmentError.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "shipment_deleted",
      entity_type: "shipment",
      entity_id: shipmentId,
      user_id: user.id,
      metadata: {
        shipment_code: existingShipment.shipment_code,
      },
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidatePath("/shipments")
    revalidatePath("/reports")

    return {
      success: true,
      message: "Shipment deleted successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete shipment.",
    }
  }
}
export async function markShipmentAsSent(shipmentId: string) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.rpc("send_shipment_atomically", {
    p_shipment_id: shipmentId,
    p_user_id: user.id,
  })

  if (error) {
    const message = error.message.toLowerCase()

    if (message.includes("shipment not found")) {
      redirect("/shipments?error=shipment-not-found")
    }

    if (message.includes("only draft shipments")) {
      redirect("/shipments?error=invalid-send-status")
    }

    if (message.includes("shipment has no items")) {
      redirect("/shipments?error=no-shipment-items")
    }

    if (
      message.includes("not enough germany inventory") ||
      message.includes("no germany inventory")
    ) {
      redirect("/shipments?error=insufficient-stock")
    }

    throw new Error(error.message)
  }

  revalidatePath("/shipments")
  revalidatePath("/inventory")
  revalidatePath("/dashboard")
  revalidatePath("/reports")
  redirect("/shipments")
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
