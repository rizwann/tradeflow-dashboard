"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { saleSchema } from "./sale-schema"

export type SaleActionState = {
  success: boolean
  message: string
}

function mapSaleErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes("no bangladesh inventory")) {
    return "No Bangladesh inventory exists for this product."
  }

  if (normalizedMessage.includes("not enough bangladesh inventory")) {
    return "Not enough Bangladesh inventory is available for this sale."
  }

  if (normalizedMessage.includes("not enough fifo batch inventory")) {
    return "Not enough FIFO batch inventory is available for this sale."
  }

  return message
}

export async function createSale(
  _prevState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  try {
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
      return {
        success: false,
        message: "Please check the sale form and try again.",
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      }
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
      return {
        success: false,
        message: mapSaleErrorMessage(error.message),
      }
    }

    revalidatePath("/sales")
    revalidatePath("/inventory")
    revalidatePath("/dashboard")
    revalidatePath("/reports")

    return {
      success: true,
      message: "Sale recorded successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to record sale.",
    }
  }
}
