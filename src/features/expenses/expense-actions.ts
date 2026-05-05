"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { expenseSchema } from "./expense-schema"

export type ExpenseActionState = {
  success: boolean
  message: string
}

export async function createExpense(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  try {
    const supabase = await createClient()

    const raw = {
      type: formData.get("type"),
      amount: formData.get("amount"),
      currency: formData.get("currency") || "BDT",
      date: formData.get("date"),
      shipment_id: formData.get("shipment_id"),
      notes: formData.get("notes"),
    }

    const parsed = expenseSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        success: false,
        message: "Please check the expense form and try again.",
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

    const { error } = await supabase.from("expenses").insert({
      type: parsed.data.type,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      date: parsed.data.date,
      paid_by: user.id,
      shipment_id: parsed.data.shipment_id || null,
      notes: parsed.data.notes || null,
    })

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "expense_added",
      entity_type: "expense",
      user_id: user.id,
      metadata: {
        type: parsed.data.type,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
      },
    })

    if (auditError) {
      return {
        success: false,
        message: auditError.message,
      }
    }

    revalidatePath("/expenses")
    revalidatePath("/dashboard")
    revalidatePath("/reports")

    return {
      success: true,
      message: "Expense added successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add expense.",
    }
  }
}
