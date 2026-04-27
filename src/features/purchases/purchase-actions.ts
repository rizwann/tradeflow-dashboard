"use server"

import { createClient } from "@/lib/supabase/server"
import { purchaseSchema } from "./purchase-schema"
import { calculatePurchasePriceBDT } from "@/lib/calculations"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPurchase(formData: FormData) {
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
    throw new Error("Invalid purchase data")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Only admin can record purchases")
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
    bought_by: user?.id,
  })

  if (purchaseError) throw new Error(purchaseError.message)

  // 2. Update inventory (Germany)
  const { data: existingInventory } = await supabase
    .from("inventory")
    .select("*")
    .eq("product_id", parsed.data.product_id)
    .eq("location", "germany")
    .single()

  if (existingInventory) {
    await supabase
      .from("inventory")
      .update({
        quantity: existingInventory.quantity + parsed.data.quantity,
      })
      .eq("id", existingInventory.id)
  } else {
    await supabase.from("inventory").insert({
      product_id: parsed.data.product_id,
      location: "germany",
      quantity: parsed.data.quantity,
    })
  }

  // 3. Log movement
  await supabase.from("inventory_movements").insert({
    product_id: parsed.data.product_id,
    from_location: null,
    to_location: "germany",
    quantity: parsed.data.quantity,
    reason: "purchase",
    created_by: user?.id,
  })

  // 4. Audit log
  await supabase.from("audit_logs").insert({
    action: "purchase_recorded",
    entity_type: "purchase",
    user_id: user?.id,
    metadata: {
      product_id: parsed.data.product_id,
      quantity: parsed.data.quantity,
    },
  })

  revalidatePath("/purchases")
  revalidatePath("/inventory")

  redirect("/purchases")
}
