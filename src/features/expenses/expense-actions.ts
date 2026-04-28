"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { expenseSchema } from "./expense-schema"

export async function createExpense(formData: FormData) {
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
    throw new Error("Invalid expense data")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
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
    throw new Error(error.message)
  }

  await supabase.from("audit_logs").insert({
    action: "expense_added",
    entity_type: "expense",
    user_id: user.id,
    metadata: {
      type: parsed.data.type,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
    },
  })

  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  revalidatePath("/reports")

  redirect("/expenses")
}
