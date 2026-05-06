import Link from "next/link"
import { Plus } from "lucide-react"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  ExpenseTable,
  type ExpenseTableRow,
} from "@/features/expenses/expense-table"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

type ExpenseRow = {
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
  notes: string | null
  paid_by: string
  shipments: {
    shipment_code: string
  } | null
}

export default async function ExpensesPage() {
  const session = await requireRole(["admin", "partner"])
  const supabase = await createClient()

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select(
      "id, type, amount, currency, date, notes, paid_by, shipments(shipment_code)",
    )
    .order("created_at", { ascending: false })
    .returns<ExpenseRow[]>()

  if (error) {
    return (
      <ErrorState title="Could not load expenses" message={error.message} />
    )
  }

  const expenseRows: ExpenseTableRow[] = (expenses ?? []).map((expense) => ({
    id: expense.id,
    type: expense.type,
    amount: expense.amount,
    currency: expense.currency,
    relatedShipment: expense.shipments?.shipment_code ?? "No shipment",
    date: expense.date,
    notes: expense.notes ?? "",
    paidById: expense.paid_by,
  }))

  const totalExpenses = expenseRows.reduce((sum, expense) => {
    if (expense.currency !== "BDT") return sum
    return sum + expense.amount
  }, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track operational costs related to shipments and resale."
        actions={
          <Button asChild>
            <Link href="/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add expense
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Total BDT expenses</p>
        <p className="mt-1 text-2xl font-bold">৳{totalExpenses}</p>
      </div>

      <ExpenseTable
        expenses={expenseRows}
        currentUserId={session.user.id}
        currentUserRole={session.profile.role}
      />
    </div>
  )
}
