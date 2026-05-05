import Link from "next/link"
import { Plus } from "lucide-react"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { SaleTable, type SaleTableRow } from "@/features/sales/sale-table"
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
  discount: number | null
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

  const saleRows: SaleTableRow[] = (sales ?? []).map((sale) => {
    const discount = Number(sale.discount ?? 0)

    return {
      id: sale.id,
      productName: sale.products?.name ?? "Unknown product",
      quantity: sale.quantity,
      unitSellingPriceBdt: sale.unit_selling_price_bdt,
      discount,
      revenue: sale.quantity * sale.unit_selling_price_bdt - discount,
      paymentStatus: sale.payment_status,
      saleDate: sale.sale_date,
    }
  })

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

      {params.error === "insufficient-fifo-batches" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          This product has Bangladesh inventory, but no matching FIFO cost
          batches. Receive a shipment again or check inventory batch data.
        </div>
      ) : null}

      <SaleTable sales={saleRows} />
    </div>
  )
}
