"use server"

import { createClient } from "@/lib/supabase/server"
import { purchaseSchema } from "./purchase-schema"
import { calculatePurchasePriceBDT } from "@/lib/calculations"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"

export type PurchaseActionState = {
  success: boolean
  message: string
}

export async function createPurchase(
  _prevState: PurchaseActionState,
  formData: FormData,
): Promise<PurchaseActionState> {
  try {
    const { user } = await requireAdmin()
    const supabase = await createClient()

    const raw = {
      product_id: formData.get("product_id"),
      quantity: formData.get("quantity"),
      unit_cost_eur: formData.get("unit_cost_eur"),
      exchange_rate: formData.get("exchange_rate"),
      purchase_date: formData.get("purchase_date"),
      notes: formData.get("notes"),
    }

    const parsed = purchaseSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the purchase form and try again.",
      }
    }

    const totalCostBDT =
      calculatePurchasePriceBDT(
        parsed.data.unit_cost_eur,
        parsed.data.exchange_rate,
      ) * parsed.data.quantity

    // 1. Insert purchase
    const { error: purchaseError } = await supabase.from("purchases").insert({
      ...parsed.data,
      total_cost_bdt: totalCostBDT,
      bought_by: user.id,
    })

    if (purchaseError) {
      return {
        success: false,
        message: purchaseError.message,
      }
    }

    // 2. Update inventory (Germany)
    const { data: existingInventory, error: inventoryFetchError } =
      await supabase
        .from("inventory")
        .select("*")
        .eq("product_id", parsed.data.product_id)
        .eq("location", "germany")
        .single()

    if (
      inventoryFetchError &&
      inventoryFetchError.code !== "PGRST116"
    ) {
      return {
        success: false,
        message: inventoryFetchError.message,
      }
    }

    if (existingInventory) {
      const { error: inventoryUpdateError } = await supabase
        .from("inventory")
        .update({
          quantity: existingInventory.quantity + parsed.data.quantity,
        })
        .eq("id", existingInventory.id)

      if (inventoryUpdateError) {
        return {
          success: false,
          message: inventoryUpdateError.message,
        }
      }
    } else {
      const { error: inventoryInsertError } = await supabase
        .from("inventory")
        .insert({
          product_id: parsed.data.product_id,
          location: "germany",
          quantity: parsed.data.quantity,
        })

      if (inventoryInsertError) {
        return {
          success: false,
          message: inventoryInsertError.message,
        }
      }
    }

    // 3. Log movement
    const { error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        product_id: parsed.data.product_id,
        from_location: null,
        to_location: "germany",
        quantity: parsed.data.quantity,
        reason: "purchase",
        created_by: user.id,
      })

    if (movementError) {
      return {
        success: false,
        message: movementError.message,
      }
    }

    // 4. Audit log
    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "purchase_recorded",
      entity_type: "purchase",
      user_id: user.id,
      metadata: {
        product_id: parsed.data.product_id,
        quantity: parsed.data.quantity,
      },
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidatePath("/purchases")
    revalidatePath("/inventory")

    return {
      success: true,
      message: "Purchase recorded successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to record purchase.",
    }
  }
}
