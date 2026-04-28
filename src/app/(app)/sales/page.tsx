import Link from "next/link"
import { Plus } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

type SalesPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

type SaleRow = {
  id: string
  quantity: number
  unit_selling_price_bdt: number
  discount: number
  sale_date: string
  payment_status: "paid" | "unpaid" | "partial"
  products: {
    name: string
  } | null
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: sales, error } = await supabase
    .from("sales")
    .select(
      "id, quantity, unit_selling_price_bdt, discount, sale_date, payment_status, products(name)",
    )
    .order("created_at", { ascending: false })
    .returns<SaleRow[]>()

  if (error) {
    return <ErrorState title="Could not load sales" message={error.message} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Record Bangladesh-side sales and customer payments."
        actions={
          <Button asChild>
            <Link href="/sales/new">
              <Plus className="mr-2 h-4 w-4" />
              Record sale
            </Link>
          </Button>
        }
      />

      {params.error === "no-bangladesh-stock" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          This product has no Bangladesh inventory. Receive a shipment before
          recording a sale.
        </div>
      ) : null}

      {params.error === "insufficient-bangladesh-stock" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Not enough Bangladesh inventory for this sale quantity.
        </div>
      ) : null}

      <div className="rounded-xl border bg-background shadow-sm">
        {sales.length ? (
          <div className="divide-y">
            {sales.map((sale) => {
              const productName = sale.products?.name ?? "Unknown product"
              const revenue =
                sale.quantity * sale.unit_selling_price_bdt - sale.discount

              return (
                <div
                  key={sale.id}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium">{productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.quantity} pcs · ৳{sale.unit_selling_price_bdt} each
                      · {sale.payment_status}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-medium">৳{revenue}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.sale_date}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No sales yet"
            description="Record your first sale after receiving inventory in Bangladesh."
          />
        )}
      </div>
    </div>
  )
}
