"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
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

  if (normalizedMessage.includes("sale not found")) {
    return "Sale could not be found."
  }

  if (normalizedMessage.includes("sale already voided")) {
    return "This sale has already been voided."
  }

  if (normalizedMessage.includes("unauthorized")) {
    return "You are not allowed to void this sale."
  }

  return message
}

export async function createSale(
  _prevState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  try {
    const session = await requireRole(["admin", "partner"])
    const supabase = await createClient()

    const raw = {
      product_id: formData.get("product_id"),
      quantity: formData.get("quantity"),
      unit_selling_price_bdt: formData.get("unit_selling_price_bdt"),
      discount: formData.get("discount") || "0",
      sale_date: formData.get("sale_date"),
      customer_id: formData.get("customer_id") || undefined,
      customer_name: formData.get("customer_name") || undefined,
      customer_phone: formData.get("customer_phone") || undefined,
      customer_address: formData.get("customer_address") || undefined,
      customer_city: formData.get("customer_city") || undefined,
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

    let customerId = parsed.data.customer_id
    let customerName = parsed.data.customer_name ?? ""
    let createdCustomerId: string | null = null
    let createdCustomerName: string | null = null

    if (customerId) {
      const { data: existingCustomer, error: existingCustomerError } =
        await supabase
          .from("customers")
          .select("id, name")
          .eq("id", customerId)
          .maybeSingle<{ id: string; name: string }>()

      if (existingCustomerError) {
        return {
          success: false,
          message: existingCustomerError.message,
        }
      }

      if (!existingCustomer) {
        return {
          success: false,
          message: "Selected customer could not be found.",
        }
      }

      customerName = existingCustomer.name
    } else {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: parsed.data.customer_name,
          phone: parsed.data.customer_phone,
          address: parsed.data.customer_address ?? null,
          city: parsed.data.customer_city ?? null,
          created_by: session.user.id,
        })
        .select("id, name")
        .single<{ id: string; name: string }>()

      if (customerError) {
        return {
          success: false,
          message: customerError.message,
        }
      }

      customerId = customer.id
      customerName = customer.name
      createdCustomerId = customer.id
      createdCustomerName = customer.name

      const { error: auditError } = await supabase.from("audit_logs").insert({
        action: "customer_created",
        entity_type: "customer",
        entity_id: customer.id,
        user_id: session.user.id,
        metadata: {
          name: parsed.data.customer_name,
          phone: parsed.data.customer_phone,
          source: "sale_inline",
        },
      })

      if (auditError) {
        await supabase.from("customers").delete().eq("id", customer.id)

        return {
          success: false,
          message: auditError.message,
        }
      }
    }

    const { error } = await supabase.rpc("record_sale_with_customer_link", {
      p_product_id: parsed.data.product_id,
      p_quantity: parsed.data.quantity,
      p_unit_selling_price_bdt: parsed.data.unit_selling_price_bdt,
      p_discount: parsed.data.discount,
      p_sale_date: parsed.data.sale_date,
      p_sold_by: session.user.id,
      p_customer_id: customerId,
      p_customer_name: customerName,
      p_payment_status: parsed.data.payment_status,
      p_notes: parsed.data.notes ?? "",
    })

    if (error) {
      if (createdCustomerId) {
        await supabase.from("customers").delete().eq("id", createdCustomerId)
        await supabase
          .from("audit_logs")
          .delete()
          .eq("entity_type", "customer")
          .eq("entity_id", createdCustomerId)
          .eq("action", "customer_created")
      }

      return {
        success: false,
        message: mapSaleErrorMessage(error.message),
      }
    }

    revalidatePath("/sales")
    revalidatePath("/customers")
    if (customerId) {
      revalidatePath(`/customers/${customerId}`)
    }
    revalidatePath("/inventory")
    revalidatePath("/dashboard")
    revalidatePath("/reports")

    return {
      success: true,
      message: createdCustomerName
        ? `Sale recorded successfully for ${createdCustomerName}.`
        : "Sale recorded successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to record sale.",
    }
  }
}

export async function voidSale(
  saleId: string,
  reason: string,
): Promise<SaleActionState> {
  try {
    const session = await requireRole(["admin", "partner"])
    const supabase = await createClient()

    if (!saleId) {
      return {
        success: false,
        message: "Sale ID is required.",
      }
    }

    const normalizedReason = reason.trim() || "Voided from sales table"

    const { error } = await supabase.rpc("void_sale_with_reversal", {
      p_sale_id: saleId,
      p_user_id: session.user.id,
      p_reason: normalizedReason,
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
      message: "Sale voided successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to void sale.",
    }
  }
}
