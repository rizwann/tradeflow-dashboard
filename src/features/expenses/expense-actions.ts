"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin, requireRole } from "@/lib/auth"
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

export async function updateExpense(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  try {
    const session = await requireRole(["admin", "partner"])
    const supabase = await createClient()
    const expenseId = formData.get("id")

    if (typeof expenseId !== "string" || expenseId.length === 0) {
      return {
        success: false,
        message: "Expense ID is required.",
      }
    }

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

    const { data: existingExpense, error: existingExpenseError } = await supabase
      .from("expenses")
      .select("id, paid_by")
      .eq("id", expenseId)
      .maybeSingle()

    if (existingExpenseError) {
      return {
        success: false,
        message: existingExpenseError.message,
      }
    }

    if (!existingExpense) {
      return {
        success: false,
        message: "Expense not found.",
      }
    }

    if (
      session.profile.role === "partner" &&
      existingExpense.paid_by !== session.user.id
    ) {
      return {
        success: false,
        message: "You can only edit your own expenses.",
      }
    }

    const { error: updateError } = await supabase
      .from("expenses")
      .update({
        type: parsed.data.type,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        date: parsed.data.date,
        shipment_id: parsed.data.shipment_id || null,
        notes: parsed.data.notes || null,
      })
      .eq("id", expenseId)

    if (updateError) {
      return {
        success: false,
        message: updateError.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "expense_updated",
      entity_type: "expense",
      entity_id: expenseId,
      user_id: session.user.id,
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
      message: "Expense updated successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update expense.",
    }
  }
}

export async function deleteExpense(
  expenseId: string,
): Promise<ExpenseActionState> {
  try {
    const { user } = await requireAdmin()
    const supabase = await createClient()

    if (!expenseId) {
      return {
        success: false,
        message: "Expense ID is required.",
      }
    }

    const { data: existingExpense, error: existingExpenseError } = await supabase
      .from("expenses")
      .select("id")
      .eq("id", expenseId)
      .maybeSingle()

    if (existingExpenseError) {
      return {
        success: false,
        message: existingExpenseError.message,
      }
    }

    if (!existingExpense) {
      return {
        success: false,
        message: "Expense not found.",
      }
    }

    const { error: deleteError } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)

    if (deleteError) {
      return {
        success: false,
        message: deleteError.message,
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      action: "expense_deleted",
      entity_type: "expense",
      entity_id: expenseId,
      user_id: user.id,
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
      message: "Expense deleted successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete expense.",
    }
  }
}
