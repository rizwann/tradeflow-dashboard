"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { inventoryAdjustmentSchema } from "./inventory-adjustment-schema"

export type InventoryActionState = {
  success: boolean
  message: string
}

function mapInventoryAdjustmentErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes("unauthorized")) {
    return "You are not allowed to adjust inventory."
  }

  if (
    normalizedMessage.includes("partners can only adjust bangladesh inventory")
  ) {
    return "Partners can only adjust Bangladesh inventory."
  }

  if (normalizedMessage.includes("invalid product selection")) {
    return "Invalid product selection."
  }

  if (normalizedMessage.includes("inventory cannot go below zero")) {
    return "Inventory cannot go below zero."
  }

  if (
    normalizedMessage.includes(
      "not enough fifo batch inventory to decrease bangladesh stock",
    )
  ) {
    return "Not enough FIFO batch inventory to decrease Bangladesh stock."
  }

  if (normalizedMessage.includes("landed cost required")) {
    return "Landed cost per unit is required for this Bangladesh adjustment."
  }

  if (
    normalizedMessage.includes(
      "cannot decrease inventory because no stock exists in that location",
    )
  ) {
    return "Cannot decrease inventory because no stock exists in that location."
  }

  if (normalizedMessage.includes("quantity must be greater than 0")) {
    return "Quantity must be greater than 0."
  }

  return message
}

export async function adjustInventory(
  _prevState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  try {
    const session = await requireRole(["admin", "partner"])
    const supabase = await createClient()

    const raw = {
      product_id: formData.get("product_id"),
      location: formData.get("location"),
      adjustment_type: formData.get("adjustment_type"),
      quantity: formData.get("quantity"),
      reason: formData.get("reason"),
      landed_cost_per_unit: formData.get("landed_cost_per_unit"),
    }

    const parsed = inventoryAdjustmentSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the adjustment form and try again.",
      }
    }

    if (
      session.profile.role === "partner" &&
      parsed.data.location !== "bangladesh"
    ) {
      return {
        success: false,
        message: "Partners can only adjust Bangladesh inventory.",
      }
    }

    const { data, error } = await supabase.rpc("adjust_inventory_with_fifo", {
      p_product_id: parsed.data.product_id,
      p_location: parsed.data.location,
      p_adjustment_type: parsed.data.adjustment_type,
      p_quantity: parsed.data.quantity,
      p_reason: parsed.data.reason,
      p_user_id: session.user.id,
      p_landed_cost_per_unit: parsed.data.landed_cost_per_unit ?? null,
    })

    if (error) {
      return {
        success: false,
        message: mapInventoryAdjustmentErrorMessage(error.message),
      }
    }

    revalidatePath("/inventory")
    revalidatePath("/dashboard")
    revalidatePath("/reports")

    return {
      success: true,
      message:
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Inventory adjusted successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to adjust inventory.",
    }
  }
}
