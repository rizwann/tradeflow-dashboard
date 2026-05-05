"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { productSchema } from "./product-schema"
import { calculatePurchasePriceBDT } from "@/lib/calculations"
import { requireAdmin } from "@/lib/auth"

export async function createProduct(formData: FormData) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  const rawValues = {
    name: formData.get("name"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    sku: formData.get("sku"),
    purchase_price_eur: formData.get("purchase_price_eur"),
    exchange_rate: formData.get("exchange_rate"),
    suggested_selling_price_bdt: formData.get("suggested_selling_price_bdt"),
    image_url: formData.get("image_url"),
    notes: formData.get("notes"),
  }

  const parsed = productSchema.safeParse(rawValues)

  if (!parsed.success) {
    throw new Error("Invalid product data")
  }

  const purchasePriceBDT = calculatePurchasePriceBDT(
    parsed.data.purchase_price_eur,
    parsed.data.exchange_rate,
  )

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      ...parsed.data,
      purchase_price_bdt: purchasePriceBDT,
      image_url: parsed.data.image_url || null,
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await supabase.from("audit_logs").insert({
    action: "product_added",
    entity_type: "product",
    entity_id: product.id,
    user_id: user.id,
    metadata: {
      name: parsed.data.name,
      sku: parsed.data.sku,
    },
  })

  revalidatePath("/products")
  redirect("/products")
}
