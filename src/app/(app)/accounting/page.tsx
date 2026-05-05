import { requireAdmin } from "@/lib/auth"

export default async function AccountingPage() {
  await requireAdmin()
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
      <p className="text-muted-foreground">
        Track investments, withdrawals, balances, and partner settlement.
      </p>
    </div>
  )
}
