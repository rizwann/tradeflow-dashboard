import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { calculateCustomerInsights } from "@/features/analytics/customer-delivery-analytics"
import { Button } from "@/components/ui/button"
import { CustomerTable, type CustomerSummaryRow } from "@/features/customers/customer-table"
import { CustomersExportButton } from "@/features/customers/customers-export-button"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Customers",
}

type CustomerRecord = {
  id: string
  name: string
  phone: string
  city: string | null
  address: string | null
  notes: string | null
  created_at: string | null
  created_by: string | null
}

type CustomerSaleAggregateRow = {
  id: string
  customer_id: string | null
  sale_date: string
  quantity: number
  unit_selling_price_bdt: number
  discount: number | null
  customers: {
    name: string
  } | null
}

type CustomerSaleProfitRow = {
  sale_id: string
  gross_profit: number
}

export default async function CustomersPage() {
  const session = await requireRole(["admin", "partner"])
  const supabase = await createClient()

  const [
    { data: customers, error: customersError },
    { data: sales, error: salesError },
    { data: saleProfits, error: saleProfitsError },
  ] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, phone, city, address, notes, created_at, created_by")
        .order("created_at", { ascending: false })
        .returns<CustomerRecord[]>(),
      supabase
        .from("sales")
        .select(
          "id, customer_id, sale_date, quantity, unit_selling_price_bdt, discount, customers(name)",
        )
        .eq("status", "active")
        .not("customer_id", "is", null)
        .returns<CustomerSaleAggregateRow[]>(),
      supabase
        .from("sale_batch_consumptions")
        .select("sale_id, gross_profit, sales!inner(status)")
        .eq("sales.status", "active")
        .returns<CustomerSaleProfitRow[]>(),
    ])

  if (customersError || salesError || saleProfitsError) {
    return (
      <ErrorState
        title="Could not load customers"
        message={(customersError ?? salesError ?? saleProfitsError)?.message}
      />
    )
  }

  const customerInsights = calculateCustomerInsights({
    customers: (customers ?? []).map((customer) => ({
      id: customer.id,
      name: customer.name,
      createdAt: customer.created_at,
    })),
    sales: (sales ?? []).map((sale) => ({
      id: sale.id,
      customerId: sale.customer_id,
      customerName: sale.customers?.name ?? null,
      productId: "",
      productName: null,
      quantity: Number(sale.quantity),
      unitSellingPriceBdt: Number(sale.unit_selling_price_bdt),
      discount: sale.discount,
      saleDate: sale.sale_date,
    })),
    saleProfits: (saleProfits ?? []).map((saleProfit) => ({
      saleId: saleProfit.sale_id,
      grossProfit: Number(saleProfit.gross_profit),
    })),
  })

  const customerSummaryById = new Map(
    customerInsights.topCustomers.map((customer) => [customer.customerId, customer]),
  )

  const customerRows: CustomerSummaryRow[] = (customers ?? []).map((customer) => {
    const summary = customerSummaryById.get(customer.id)

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      notes: customer.notes,
      createdAt: customer.created_at,
      createdBy: customer.created_by,
      ordersCount: summary?.ordersCount ?? 0,
      totalRevenue: summary?.revenue ?? 0,
      totalProfit: summary?.profit ?? 0,
      lastOrderDate: summary?.lastOrderDate ?? null,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Store buyer profiles, order history context, and delivery-ready contact details."
        actions={
          <>
            <CustomersExportButton rows={customerRows} />
            <Button asChild>
              <Link href="/customers/new">
                <Plus className="mr-2 h-4 w-4" />
                Add customer
              </Link>
            </Button>
          </>
        }
      />

      <CustomerTable
        customers={customerRows}
        currentUserId={session.user.id}
        currentUserRole={session.profile.role}
      />
    </div>
  )
}
