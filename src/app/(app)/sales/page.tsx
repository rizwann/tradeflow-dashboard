import Link from "next/link"
import { Plus } from "lucide-react"
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
    return (
      <div className="rounded-xl border bg-background p-6">
        <h1 className="text-xl font-semibold">Could not load sales</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            Record Bangladesh-side sales and customer payments.
          </p>
        </div>

        <Button asChild>
          <Link href="/sales/new">
            <Plus className="mr-2 h-4 w-4" />
            Record sale
          </Link>
        </Button>
      </div>

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
          <div className="p-8 text-center">
            <h2 className="font-semibold">No sales yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Record your first sale after receiving inventory in Bangladesh.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
