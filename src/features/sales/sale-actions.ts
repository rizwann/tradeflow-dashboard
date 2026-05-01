"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { saleSchema } from "./sale-schema"

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

  const { error } = await supabase.rpc("record_sale_with_fifo", {
    p_product_id: parsed.data.product_id,
    p_quantity: parsed.data.quantity,
    p_unit_selling_price_bdt: parsed.data.unit_selling_price_bdt,
    p_discount: parsed.data.discount,
    p_sale_date: parsed.data.sale_date,
    p_sold_by: user.id,
    p_customer_name: parsed.data.customer_name ?? "",
    p_payment_status: parsed.data.payment_status,
    p_notes: parsed.data.notes ?? "",
  })

  if (error) {
    const message = error.message.toLowerCase()

    if (message.includes("no bangladesh inventory")) {
      redirect("/sales?error=no-bangladesh-stock")
    }

    if (message.includes("not enough bangladesh inventory")) {
      redirect("/sales?error=insufficient-bangladesh-stock")
    }

    if (message.includes("not enough fifo batch inventory")) {
      redirect("/sales?error=insufficient-fifo-batches")
    }

    throw new Error(error.message)
  }

  revalidatePath("/sales")
  revalidatePath("/inventory")
  revalidatePath("/dashboard")
  revalidatePath("/reports")

  redirect("/sales")
}
