import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
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
  customer_id: string | null
  quantity: number
  unit_selling_price_bdt: number
  discount: number | null
}

export default async function CustomersPage() {
  const session = await requireRole(["admin", "partner"])
  const supabase = await createClient()

  const [{ data: customers, error: customersError }, { data: sales, error: salesError }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, phone, city, address, notes, created_at, created_by")
        .order("created_at", { ascending: false })
        .returns<CustomerRecord[]>(),
      supabase
        .from("sales")
        .select("customer_id, quantity, unit_selling_price_bdt, discount")
        .eq("status", "active")
        .not("customer_id", "is", null)
        .returns<CustomerSaleAggregateRow[]>(),
    ])

  if (customersError || salesError) {
    return (
      <ErrorState
        title="Could not load customers"
        message={(customersError ?? salesError)?.message}
      />
    )
  }

  const salesSummaryByCustomer = new Map<
    string,
    { ordersCount: number; totalRevenue: number }
  >()

  for (const sale of sales ?? []) {
    if (!sale.customer_id) continue

    const existingSummary = salesSummaryByCustomer.get(sale.customer_id) ?? {
      ordersCount: 0,
      totalRevenue: 0,
    }

    existingSummary.ordersCount += 1
    existingSummary.totalRevenue +=
      Number(sale.quantity) * Number(sale.unit_selling_price_bdt) -
      Number(sale.discount ?? 0)

    salesSummaryByCustomer.set(sale.customer_id, existingSummary)
  }

  const customerRows: CustomerSummaryRow[] = (customers ?? []).map((customer) => {
    const summary = salesSummaryByCustomer.get(customer.id)

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
      totalRevenue: summary?.totalRevenue ?? 0,
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
