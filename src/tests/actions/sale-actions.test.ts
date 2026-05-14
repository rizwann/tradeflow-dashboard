jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn(),
}))

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}))

import { createSale } from "@/features/sales/sale-actions"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type CustomerRecord = {
  id: string
  name: string
}

function createCustomersTableMock({
  existingCustomer,
  createdCustomer,
}: {
  existingCustomer?: CustomerRecord | null
  createdCustomer?: CustomerRecord | null
}) {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: existingCustomer ?? null,
    error: null,
  })
  const insertSingle = jest.fn().mockResolvedValue({
    data: createdCustomer ?? null,
    error: null,
  })

  return {
    maybeSingle,
    insertSingle,
    table: {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle,
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: insertSingle,
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    },
  }
}

describe("createSale", () => {
  beforeEach(() => {
    ;(requireRole as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
      profile: { role: "partner" },
    })
  })

  it("records a sale against an existing customer", async () => {
    const customersMock = createCustomersTableMock({
      existingCustomer: { id: "cust-1", name: "Rahim Traders" },
    })
    const auditInsert = jest.fn().mockResolvedValue({ error: null })
    const rpc = jest.fn().mockResolvedValue({ error: null })

    ;(createClient as jest.Mock).mockResolvedValue({
      from: jest.fn((table: string) => {
        if (table === "customers") return customersMock.table
        if (table === "audit_logs") return { insert: auditInsert }
        throw new Error(`Unexpected table ${table}`)
      }),
      rpc,
    })

    const formData = new FormData()
    formData.set("product_id", "550e8400-e29b-41d4-a716-446655440000")
    formData.set("quantity", "1")
    formData.set("unit_selling_price_bdt", "1200")
    formData.set("discount", "0")
    formData.set("sale_date", "2026-05-06")
    formData.set("customer_id", "550e8400-e29b-41d4-a716-446655440001")
    formData.set("payment_status", "paid")
    formData.set("notes", "Repeat order")

    const result = await createSale({ success: false, message: "" }, formData)

    expect(result).toEqual({
      success: true,
      message: "Sale recorded successfully.",
    })
    expect(customersMock.maybeSingle).toHaveBeenCalled()
    expect(customersMock.insertSingle).not.toHaveBeenCalled()
    expect(auditInsert).not.toHaveBeenCalled()
    expect(rpc).toHaveBeenCalledWith(
      "record_sale_with_customer_link",
      expect.objectContaining({
        p_customer_id: "550e8400-e29b-41d4-a716-446655440001",
        p_customer_name: "Rahim Traders",
      }),
    )
  })

  it("creates a new customer before recording the sale", async () => {
    const customersMock = createCustomersTableMock({
      createdCustomer: { id: "cust-new", name: "New Buyer" },
    })
    const auditInsert = jest.fn().mockResolvedValue({ error: null })
    const rpc = jest.fn().mockResolvedValue({ error: null })

    ;(createClient as jest.Mock).mockResolvedValue({
      from: jest.fn((table: string) => {
        if (table === "customers") return customersMock.table
        if (table === "audit_logs") return { insert: auditInsert }
        throw new Error(`Unexpected table ${table}`)
      }),
      rpc,
    })

    const formData = new FormData()
    formData.set("product_id", "550e8400-e29b-41d4-a716-446655440000")
    formData.set("quantity", "1")
    formData.set("unit_selling_price_bdt", "1200")
    formData.set("discount", "0")
    formData.set("sale_date", "2026-05-06")
    formData.set("customer_name", "New Buyer")
    formData.set("customer_phone", "+8801812345678")
    formData.set("customer_city", "Chattogram")
    formData.set("customer_address", "Port road")
    formData.set("payment_status", "paid")

    const result = await createSale({ success: false, message: "" }, formData)

    expect(result).toEqual({
      success: true,
      message: "Sale recorded successfully for New Buyer.",
    })
    expect(customersMock.insertSingle).toHaveBeenCalled()
    expect(auditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "customer_created",
        entity_type: "customer",
        metadata: expect.objectContaining({
          name: "New Buyer",
          phone: "+8801812345678",
          source: "sale_inline",
        }),
      }),
    )
    expect(rpc).toHaveBeenCalledWith(
      "record_sale_with_customer_link",
      expect.objectContaining({
        p_customer_id: "cust-new",
        p_customer_name: "New Buyer",
      }),
    )
  })
})
