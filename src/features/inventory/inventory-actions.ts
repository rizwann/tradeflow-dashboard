"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { inventoryAdjustmentSchema } from "./inventory-adjustment-schema"

export type InventoryActionState = {
  success: boolean
  message: string
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

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", parsed.data.product_id)
      .maybeSingle()

    if (productError) {
      return {
        success: false,
        message: productError.message,
      }
    }

    if (!product) {
      return {
        success: false,
        message: "Invalid product selection.",
      }
    }

    const { data: existingInventory, error: fetchError } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", parsed.data.product_id)
      .eq("location", parsed.data.location)
      .maybeSingle()

    if (fetchError) {
      return {
        success: false,
        message: fetchError.message,
      }
    }

    const previousQuantity = existingInventory?.quantity ?? 0
    const hasExistingRow = Boolean(existingInventory)

    if (!hasExistingRow && parsed.data.adjustment_type === "decrease") {
      return {
        success: false,
        message: "Cannot decrease inventory because no stock exists in that location.",
      }
    }

    let newQuantity = previousQuantity

    if (parsed.data.adjustment_type === "increase") {
      newQuantity = previousQuantity + parsed.data.quantity
    }

    if (parsed.data.adjustment_type === "decrease") {
      newQuantity = previousQuantity - parsed.data.quantity
    }

    if (parsed.data.adjustment_type === "set") {
      newQuantity = parsed.data.quantity
    }

    if (newQuantity < 0) {
      return {
        success: false,
        message: "Inventory cannot go below zero.",
      }
    }

    let inventoryId = existingInventory?.id ?? ""

    if (existingInventory) {
      const { error: updateError } = await supabase
        .from("inventory")
        .update({ quantity: newQuantity })
        .eq("id", existingInventory.id)

      if (updateError) {
        return {
          success: false,
          message: updateError.message,
        }
      }

      inventoryId = existingInventory.id
    } else {
      const { data: insertedInventory, error: insertError } = await supabase
        .from("inventory")
        .insert({
          product_id: parsed.data.product_id,
          location: parsed.data.location,
          quantity: newQuantity,
        })
        .select("id")
        .single()

      if (insertError) {
        return {
          success: false,
          message: insertError.message,
        }
      }

      inventoryId = insertedInventory.id
    }

    const movementQuantity =
      parsed.data.adjustment_type === "set"
        ? Math.abs(newQuantity - previousQuantity)
        : parsed.data.quantity

    const fromLocation =
      parsed.data.adjustment_type === "increase"
        ? null
        : parsed.data.location
    const toLocation =
      parsed.data.adjustment_type === "decrease"
        ? null
        : parsed.data.location

    const { error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        product_id: parsed.data.product_id,
        from_location: fromLocation,
        to_location: toLocation,
        quantity: movementQuantity,
        reason: `manual_adjustment: ${parsed.data.reason}`,
        created_by: session.user.id,
      })

    if (movementError) {
      return {
        success: false,
        message: movementError.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "inventory_adjusted",
      entity_type: "inventory",
      entity_id: inventoryId,
      user_id: session.user.id,
      metadata: {
        product_id: parsed.data.product_id,
        location: parsed.data.location,
        adjustment_type: parsed.data.adjustment_type,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        reason: parsed.data.reason,
      },
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidatePath("/inventory")
    revalidatePath("/dashboard")
    revalidatePath("/reports")

    return {
      success: true,
      message: "Inventory adjusted successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to adjust inventory.",
    }
  }
}
