import { createClient } from "@/lib/supabase/server"
import { ExpenseForm } from "@/features/expenses/expense-form"

export default async function NewExpensePage() {
  const supabase = await createClient()

  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, shipment_code")
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add expense</h1>
        <p className="text-muted-foreground">
          Track shipping, customs, packaging, marketing, delivery, or other
          costs.
        </p>
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <ExpenseForm shipments={shipments ?? []} />
      </div>
    </div>
  )
}
