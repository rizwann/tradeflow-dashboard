jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn(),
}))

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}))

import {
  createOrUpdateDelivery,
  markDeliveryDelivered,
} from "@/features/deliveries/delivery-actions"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

describe("delivery actions", () => {
  beforeEach(() => {
    ;(requireRole as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
      profile: { role: "partner" },
    })
  })

  it("creates a delivery when none exists for the sale", async () => {
    const auditInsert = jest.fn().mockResolvedValue({ error: null })
    const saleMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: "sale-1",
        sold_by: "user-1",
        customer_id: "cust-1",
        status: "active",
        customers: { created_by: "user-1" },
      },
      error: null,
    })
    const deliveryMaybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    })
    const deliveryInsertSingle = jest.fn().mockResolvedValue({
      data: { id: "del-1" },
      error: null,
    })

    const supabase = {
      from: jest.fn((table: string) => {
        if (table === "sales") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({
                  returns: saleMaybeSingle,
                })),
              })),
            })),
          }
        }

        if (table === "sales_deliveries") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({
                  returns: deliveryMaybeSingle,
                })),
              })),
            })),
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: deliveryInsertSingle,
              })),
            })),
          }
        }

        if (table === "audit_logs") {
          return { insert: auditInsert }
        }

        throw new Error(`Unexpected table ${table}`)
      }),
    }

    ;(createClient as jest.Mock).mockResolvedValue(supabase)

    const formData = new FormData()
    formData.set("sale_id", "550e8400-e29b-41d4-a716-446655440000")
    formData.set("customer_id", "550e8400-e29b-41d4-a716-446655440001")
    formData.set("status", "pending")
    formData.set("delivery_cost", "80")
    formData.set("delivery_cost_paid_by", "business")

    const result = await createOrUpdateDelivery(
      { success: false, message: "" },
      formData,
    )

    expect(result).toEqual({
      success: true,
      message: "Delivery created successfully.",
    })
    expect(deliveryInsertSingle).toHaveBeenCalled()
    expect(auditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delivery_created",
        entity_type: "sales_delivery",
      }),
    )
  })

  it("marks a delivery as delivered", async () => {
    const auditInsert = jest.fn().mockResolvedValue({ error: null })
    const updateEq = jest.fn().mockResolvedValue({ error: null })
    const deliveryMaybeSingleReturns = jest.fn().mockResolvedValue({
      data: {
        id: "del-1",
        sale_id: "sale-1",
        customer_id: "cust-1",
        created_by: "user-1",
        status: "pending",
        delivery_cost: 80,
        delivery_cost_paid_by: "business",
        sales: {
          id: "sale-1",
          sold_by: "user-1",
          customer_id: "cust-1",
          status: "active",
          customers: { created_by: "user-1" },
        },
      },
      error: null,
    })
    const supabase = {
      from: jest.fn((table: string) => {
        if (table === "sales_deliveries") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({
                  returns: deliveryMaybeSingleReturns,
                })),
              })),
            })),
            update: jest.fn(() => ({
              eq: updateEq,
            })),
          }
        }

        if (table === "audit_logs") {
          return { insert: auditInsert }
        }

        throw new Error(`Unexpected table ${table}`)
      }),
    }

    ;(createClient as jest.Mock).mockResolvedValue(supabase)

    const result = await markDeliveryDelivered("del-1")

    expect(result).toEqual({
      success: true,
      message: "Delivery marked as delivered.",
    })
    expect(updateEq).toHaveBeenCalled()
    expect(auditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delivery_marked_delivered",
      }),
    )
  })
})
