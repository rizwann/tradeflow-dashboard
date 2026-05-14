"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { customerSchema } from "./customer-schema"

export type CustomerActionState = {
  success: boolean
  message: string
}

function toNullableString(value: string | undefined) {
  return value ?? null
}

export async function createCustomer(
  _prevState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  try {
    const session = await requireRole(["admin", "partner"])
    const supabase = await createClient()

    const rawValues = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      notes: formData.get("notes"),
    }

    const parsed = customerSchema.safeParse(rawValues)

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the customer form and try again.",
      }
    }

    const { data: customer, error: createError } = await supabase
      .from("customers")
      .insert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        address: toNullableString(parsed.data.address),
        city: toNullableString(parsed.data.city),
        notes: toNullableString(parsed.data.notes),
        created_by: session.user.id,
      })
      .select("id")
      .single<{ id: string }>()

    if (createError) {
      return {
        success: false,
        message: createError.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "customer_created",
      entity_type: "customer",
      entity_id: customer.id,
      user_id: session.user.id,
      metadata: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidatePath("/customers")

    return {
      success: true,
      message: "Customer created successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create customer.",
    }
  }
}

export async function updateCustomer(
  _prevState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  try {
    const session = await requireRole(["admin", "partner"])
    const supabase = await createClient()
    const customerId = formData.get("id")

    if (typeof customerId !== "string" || customerId.length === 0) {
      return {
        success: false,
        message: "Customer ID is required.",
      }
    }

    const rawValues = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      notes: formData.get("notes"),
    }

    const parsed = customerSchema.safeParse(rawValues)

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the customer form and try again.",
      }
    }

    const { data: existingCustomer, error: existingCustomerError } =
      await supabase
        .from("customers")
        .select("id, created_by")
        .eq("id", customerId)
        .maybeSingle<{ id: string; created_by: string | null }>()

    if (existingCustomerError) {
      return {
        success: false,
        message: existingCustomerError.message,
      }
    }

    if (!existingCustomer) {
      return {
        success: false,
        message: "Customer not found.",
      }
    }

    if (
      session.profile.role === "partner" &&
      existingCustomer.created_by !== session.user.id
    ) {
      return {
        success: false,
        message: "You can only edit customers you created.",
      }
    }

    const { error: updateError } = await supabase
      .from("customers")
      .update({
        name: parsed.data.name,
        phone: parsed.data.phone,
        address: toNullableString(parsed.data.address),
        city: toNullableString(parsed.data.city),
        notes: toNullableString(parsed.data.notes),
      })
      .eq("id", customerId)

    if (updateError) {
      return {
        success: false,
        message: updateError.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "customer_updated",
      entity_type: "customer",
      entity_id: customerId,
      user_id: session.user.id,
      metadata: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)

    return {
      success: true,
      message: "Customer updated successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update customer.",
    }
  }
}
