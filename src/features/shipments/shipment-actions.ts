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

export async function createShipment(
  _prevState: ShipmentActionState,
  formData: FormData,
): Promise<ShipmentActionState> {
  try {
    const supabase = await createClient()

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

    const parsed = shipmentFormSchema.safeParse(raw)

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

    // handle items (dynamic)
    const totalQuantity = parsed.data.items.reduce((sum, item) => {
      return sum + item.quantity
    }, 0)

    if (totalQuantity <= 0) {
      return {
        success: false,
        message: "Shipment must have at least one valid item quantity.",
      }
    }

    const totalShippingCost = parsed.data.shipping_cost
    const totalCustomsCost = parsed.data.customs_cost

    const items = parsed.data.items.map((item) => {
      const quantityRatio = item.quantity / totalQuantity

      const allocatedShippingCost = totalShippingCost * quantityRatio
      const allocatedCustomsCost = totalCustomsCost * quantityRatio
      const allocatedTotalCost = allocatedShippingCost + allocatedCustomsCost

      return {
        shipment_id: shipment.id,
        product_id: item.product_id,
        quantity: item.quantity,
        allocated_cost: allocatedTotalCost,
        allocated_shipping_cost: allocatedShippingCost,
        allocated_customs_cost: allocatedCustomsCost,
        landed_cost_per_unit: allocatedTotalCost / item.quantity,
      }
    })

    const { error: shipmentItemsError } = await supabase
      .from("shipment_items")
      .insert(items)

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
