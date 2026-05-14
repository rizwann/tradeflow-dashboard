"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import {
  deliverySchema,
  type DeliveryCostPaidBy,
  type DeliveryStatus,
} from "./delivery-schema"

export type DeliveryActionState = {
  success: boolean
  message: string
}

type DeliverySaleContext = {
  id: string
  sold_by: string
  customer_id: string | null
  status: "active" | "voided"
  customers: {
    created_by: string | null
  } | null
}

type DeliveryRecord = {
  id: string
  sale_id: string
  customer_id: string | null
  created_by: string | null
  status: DeliveryStatus
  delivery_cost: number
  delivery_cost_paid_by: DeliveryCostPaidBy
  sales: DeliverySaleContext | null
}

function toNullableString(value: string | undefined) {
  return value ?? null
}

function revalidateDeliveryPaths(customerId?: string | null) {
  revalidatePath("/sales")
  revalidatePath("/deliveries")
  revalidatePath("/customers")
  revalidatePath("/dashboard")
  revalidatePath("/reports")

  if (customerId) {
    revalidatePath(`/customers/${customerId}`)
  }
}

function canManageDelivery(params: {
  role: "admin" | "partner"
  currentUserId: string
  sale: DeliverySaleContext
  deliveryCreatedBy?: string | null
}) {
  if (params.role === "admin") {
    return true
  }

  return (
    params.sale.sold_by === params.currentUserId ||
    params.sale.customers?.created_by === params.currentUserId ||
    params.deliveryCreatedBy === params.currentUserId
  )
}

async function getSaleContext(saleId: string) {
  const supabase = await createClient()

  const { data: sale, error } = await supabase
    .from("sales")
    .select("id, sold_by, customer_id, status, customers(created_by)")
    .eq("id", saleId)
    .maybeSingle()
    .returns<DeliverySaleContext | null>()

  return { sale, error, supabase }
}

async function getDeliveryContext(deliveryId: string) {
  const supabase = await createClient()

  const { data: delivery, error } = await supabase
    .from("sales_deliveries")
    .select(
      "id, sale_id, customer_id, created_by, status, delivery_cost, delivery_cost_paid_by, sales(id, sold_by, customer_id, status, customers(created_by))",
    )
    .eq("id", deliveryId)
    .maybeSingle()
    .returns<DeliveryRecord | null>()

  return { delivery, error, supabase }
}

async function insertAuditLog(params: {
  action: string
  deliveryId: string
  userId: string
  saleId: string
  status: DeliveryStatus
  deliveryCost: number
  deliveryCostPaidBy: DeliveryCostPaidBy
}) {
  const supabase = await createClient()

  return supabase.from("audit_logs").insert({
    action: params.action,
    entity_type: "sales_delivery",
    entity_id: params.deliveryId,
    user_id: params.userId,
    metadata: {
      sale_id: params.saleId,
      status: params.status,
      delivery_cost: params.deliveryCost,
      delivery_cost_paid_by: params.deliveryCostPaidBy,
    },
  })
}

export async function createOrUpdateDelivery(
  _prevState: DeliveryActionState,
  formData: FormData,
): Promise<DeliveryActionState> {
  try {
    const session = await requireRole(["admin", "partner"])
    const rawValues = {
      sale_id: formData.get("sale_id"),
      customer_id: formData.get("customer_id") || undefined,
      status: formData.get("status"),
      delivery_method: formData.get("delivery_method"),
      tracking_number: formData.get("tracking_number"),
      delivery_cost: formData.get("delivery_cost") || "0",
      delivery_cost_paid_by: formData.get("delivery_cost_paid_by"),
      shipped_at: formData.get("shipped_at"),
      delivered_at: formData.get("delivered_at"),
      notes: formData.get("notes"),
    }

    const parsed = deliverySchema.safeParse(rawValues)

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the delivery form and try again.",
      }
    }

    const { sale, error: saleError, supabase } = await getSaleContext(
      parsed.data.sale_id,
    )

    if (saleError) {
      return {
        success: false,
        message: saleError.message,
      }
    }

    if (!sale) {
      return {
        success: false,
        message: "Sale could not be found.",
      }
    }

    if (sale.status === "voided") {
      return {
        success: false,
        message: "Delivery cannot be managed for a voided sale.",
      }
    }

    const { data: existingDelivery, error: existingDeliveryError } =
      await supabase
        .from("sales_deliveries")
        .select("id, created_by")
        .eq("sale_id", parsed.data.sale_id)
        .maybeSingle<{ id: string; created_by: string | null }>()

    if (existingDeliveryError) {
      return {
        success: false,
        message: existingDeliveryError.message,
      }
    }

    if (
      !canManageDelivery({
        role: session.profile.role,
        currentUserId: session.user.id,
        sale,
        deliveryCreatedBy: existingDelivery?.created_by,
      })
    ) {
      return {
        success: false,
        message: "You are not allowed to manage this delivery.",
      }
    }

    const nextCustomerId = parsed.data.customer_id ?? sale.customer_id ?? null
    const payload = {
      customer_id: nextCustomerId,
      status: parsed.data.status,
      delivery_method: toNullableString(parsed.data.delivery_method),
      tracking_number: toNullableString(parsed.data.tracking_number),
      delivery_cost: parsed.data.delivery_cost,
      delivery_cost_paid_by: parsed.data.delivery_cost_paid_by,
      shipped_at: toNullableString(parsed.data.shipped_at),
      delivered_at: toNullableString(parsed.data.delivered_at),
      notes: toNullableString(parsed.data.notes),
      updated_at: new Date().toISOString(),
    }

    if (existingDelivery) {
      const { error: updateError } = await supabase
        .from("sales_deliveries")
        .update(payload)
        .eq("id", existingDelivery.id)

      if (updateError) {
        return {
          success: false,
          message: updateError.message,
        }
      }

      const { error: auditError } = await insertAuditLog({
        action: "delivery_updated",
        deliveryId: existingDelivery.id,
        userId: session.user.id,
        saleId: parsed.data.sale_id,
        status: parsed.data.status,
        deliveryCost: parsed.data.delivery_cost,
        deliveryCostPaidBy: parsed.data.delivery_cost_paid_by,
      })

      if (auditError) {
        return {
          success: false,
          message: auditError.message,
        }
      }

      revalidateDeliveryPaths(nextCustomerId)

      return {
        success: true,
        message: "Delivery updated successfully.",
      }
    }

    const { data: delivery, error: createError } = await supabase
      .from("sales_deliveries")
      .insert({
        sale_id: parsed.data.sale_id,
        created_by: session.user.id,
        ...payload,
      })
      .select("id")
      .single<{ id: string }>()

    if (createError) {
      return {
        success: false,
        message: createError.message,
      }
    }

    const { error: auditError } = await insertAuditLog({
      action: "delivery_created",
      deliveryId: delivery.id,
      userId: session.user.id,
      saleId: parsed.data.sale_id,
      status: parsed.data.status,
      deliveryCost: parsed.data.delivery_cost,
      deliveryCostPaidBy: parsed.data.delivery_cost_paid_by,
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidateDeliveryPaths(nextCustomerId)

    return {
      success: true,
      message: "Delivery created successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to save delivery.",
    }
  }
}

async function updateDeliveryStatus(
  deliveryId: string,
  nextStatus: DeliveryStatus,
  actionLabel: string,
) {
  try {
    const session = await requireRole(["admin", "partner"])
    const { delivery, error, supabase } = await getDeliveryContext(deliveryId)

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    if (!delivery || !delivery.sales) {
      return {
        success: false,
        message: "Delivery could not be found.",
      }
    }

    if (delivery.sales.status === "voided") {
      return {
        success: false,
        message: "Delivery cannot be managed for a voided sale.",
      }
    }

    if (
      !canManageDelivery({
        role: session.profile.role,
        currentUserId: session.user.id,
        sale: delivery.sales,
        deliveryCreatedBy: delivery.created_by,
      })
    ) {
      return {
        success: false,
        message: "You are not allowed to manage this delivery.",
      }
    }

    if (nextStatus === "shipped" && delivery.status !== "pending") {
      return {
        success: false,
        message: "Only pending deliveries can be marked as shipped.",
      }
    }

    if (
      nextStatus === "delivered" &&
      delivery.status !== "pending" &&
      delivery.status !== "shipped"
    ) {
      return {
        success: false,
        message: "Only pending or shipped deliveries can be marked as delivered.",
      }
    }

    if (
      nextStatus === "cancelled" &&
      (delivery.status === "delivered" || delivery.status === "cancelled")
    ) {
      return {
        success: false,
        message: "This delivery can no longer be cancelled.",
      }
    }

    const now = new Date().toISOString()
    const updatePayload: {
      status: DeliveryStatus
      updated_at: string
      shipped_at?: string
      delivered_at?: string | null
    } = {
      status: nextStatus,
      updated_at: now,
    }

    if (nextStatus === "shipped") {
      updatePayload.shipped_at = now
    }

    if (nextStatus === "delivered") {
      if (delivery.status === "pending") {
        updatePayload.shipped_at = now
      }
      updatePayload.delivered_at = now
    }

    if (nextStatus === "cancelled") {
      updatePayload.delivered_at = null
    }

    const { error: updateError } = await supabase
      .from("sales_deliveries")
      .update(updatePayload)
      .eq("id", delivery.id)

    if (updateError) {
      return {
        success: false,
        message: updateError.message,
      }
    }

    const { error: auditError } = await insertAuditLog({
      action: actionLabel,
      deliveryId: delivery.id,
      userId: session.user.id,
      saleId: delivery.sale_id,
      status: nextStatus,
      deliveryCost: Number(delivery.delivery_cost),
      deliveryCostPaidBy: delivery.delivery_cost_paid_by,
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidateDeliveryPaths(delivery.customer_id ?? delivery.sales.customer_id)

    return {
      success: true,
      message:
        nextStatus === "shipped"
          ? "Delivery marked as shipped."
          : nextStatus === "delivered"
            ? "Delivery marked as delivered."
            : "Delivery cancelled successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update delivery.",
    }
  }
}

export async function markDeliveryShipped(deliveryId: string) {
  return updateDeliveryStatus(deliveryId, "shipped", "delivery_marked_shipped")
}

export async function markDeliveryDelivered(deliveryId: string) {
  return updateDeliveryStatus(
    deliveryId,
    "delivered",
    "delivery_marked_delivered",
  )
}

export async function cancelDelivery(deliveryId: string) {
  return updateDeliveryStatus(deliveryId, "cancelled", "delivery_cancelled")
}
