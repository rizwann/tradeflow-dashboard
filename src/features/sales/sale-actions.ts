"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { saleSchema } from "./sale-schema"
import { consumeFifoBatches } from "@/lib/fifo"

export async function createSale(formData: FormData) {
  const supabase = await createClient()

  const raw = {
    product_id: formData.get("product_id"),
    quantity: formData.get("quantity"),
    unit_selling_price_bdt: formData.get("unit_selling_price_bdt"),
    discount: formData.get("discount") || "0",
    sale_date: formData.get("sale_date"),
    customer_name: formData.get("customer_name") || undefined,
    payment_status: formData.get("payment_status"),
    notes: formData.get("notes") || undefined,
  }

  const parsed = saleSchema.safeParse(raw)

  if (!parsed.success) {
    throw new Error("Invalid sale data")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("product_id", parsed.data.product_id)
    .eq("location", "bangladesh")
    .single()

  if (inventoryError || !inventory) {
    redirect("/sales?error=no-bangladesh-stock")
  }

  if (inventory.quantity < parsed.data.quantity) {
    redirect("/sales?error=insufficient-bangladesh-stock")
  }

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      product_id: parsed.data.product_id,
      quantity: parsed.data.quantity,
      unit_selling_price_bdt: parsed.data.unit_selling_price_bdt,
      discount: parsed.data.discount,
      sale_date: parsed.data.sale_date,
      sold_by: user.id,
      customer_name: parsed.data.customer_name || null,
      payment_status: parsed.data.payment_status,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single()

  if (saleError || !sale) {
    throw new Error(saleError?.message ?? "Could not create sale")
  }

  const { error: inventoryUpdateError } = await supabase
    .from("inventory")
    .update({
      quantity: inventory.quantity - parsed.data.quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inventory.id)

  if (inventoryUpdateError) {
    throw new Error(inventoryUpdateError.message)
  }

  await supabase.from("inventory_movements").insert({
    product_id: parsed.data.product_id,
    from_location: "bangladesh",
    to_location: null,
    quantity: parsed.data.quantity,
    reason: "sale",
    created_by: user.id,
  })

  try {
    const totalSaleRevenue =
      parsed.data.quantity * parsed.data.unit_selling_price_bdt -
      Number(parsed.data.discount ?? 0)

    const revenuePerUnit = totalSaleRevenue / parsed.data.quantity

    await consumeFifoBatches({
      supabase,
      saleId: sale.id,
      productId: parsed.data.product_id,
      quantity: parsed.data.quantity,
      revenuePerUnit,
    })
  } catch {
    redirect("/sales?error=insufficient-fifo-batches")
  }

  await supabase.from("audit_logs").insert({
    action: "sale_recorded",
    entity_type: "sale",
    user_id: user.id,
    metadata: {
      product_id: parsed.data.product_id,
      quantity: parsed.data.quantity,
      unit_selling_price_bdt: parsed.data.unit_selling_price_bdt,
    },
  })

  revalidatePath("/sales")
  revalidatePath("/inventory")
  revalidatePath("/dashboard")

  redirect("/sales")
}
