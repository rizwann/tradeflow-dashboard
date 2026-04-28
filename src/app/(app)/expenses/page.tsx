import Link from "next/link"
import { Plus } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
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
  shipments: {
    shipment_code: string
  } | null
}

export default async function ExpensesPage() {
  const supabase = await createClient()

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("id, type, amount, currency, date, notes, shipments(shipment_code)")
    .order("created_at", { ascending: false })
    .returns<ExpenseRow[]>()

  if (error) {
    return (
      <ErrorState title="Could not load expenses" message={error.message} />
    )
  }

  const totalExpenses = expenses.reduce((sum, expense) => {
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

      <div className="rounded-xl border bg-background shadow-sm">
        {expenses.length ? (
          <div className="divide-y">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium capitalize">{expense.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.shipments?.shipment_code ?? "No shipment"} ·{" "}
                    {expense.date}
                  </p>
                  {expense.notes ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {expense.notes}
                    </p>
                  ) : null}
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-medium">
                    {expense.currency} {expense.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No expenses yet"
            description="Add your first expense to start tracking operational costs."
          />
        )}
      </div>
    </div>
  )
}
