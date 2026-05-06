import { notFound } from "next/navigation"

import { ExpenseForm } from "@/features/expenses/expense-form"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type EditExpensePageProps = {
  params: Promise<{
    id: string
  }>
}

type ExpenseRecord = {
  id: string
  type:
    | "shipping"
    | "customs"
    | "packaging"
    | "marketing"
    | "delivery"
    | "other"
  amount: number
  currency: string
  date: string
  shipment_id: string | null
  notes: string | null
  paid_by: string
}

type ShipmentOption = {
  id: string
  shipment_code: string
}

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const session = await requireRole(["admin", "partner"])
  const { id } = await params
  const supabase = await createClient()

  const [{ data: expense, error: expenseError }, { data: shipments, error: shipmentsError }] =
    await Promise.all([
      supabase
        .from("expenses")
        .select("id, type, amount, currency, date, shipment_id, notes, paid_by")
        .eq("id", id)
        .maybeSingle()
        .returns<ExpenseRecord | null>(),
      supabase
        .from("shipments")
        .select("id, shipment_code")
        .order("created_at", { ascending: false })
        .returns<ShipmentOption[]>(),
    ])

  if (expenseError || shipmentsError) {
    throw expenseError ?? shipmentsError
  }

  if (!expense) {
    notFound()
  }

  if (
    session.profile.role === "partner" &&
    expense.paid_by !== session.user.id
  ) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit expense</h1>
        <p className="text-muted-foreground">
          Update operating cost details and related shipment information.
        </p>
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <ExpenseForm
          mode="edit"
          shipments={shipments ?? []}
          expense={expense}
        />
      </div>
    </div>
  )
}
