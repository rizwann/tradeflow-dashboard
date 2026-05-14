import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { CustomerForm } from "@/features/customers/customer-form"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Edit Customer",
}

type EditCustomerPageProps = {
  params: Promise<{
    id: string
  }>
}

type CustomerRecord = {
  id: string
  name: string
  phone: string
  address: string | null
  city: string | null
  notes: string | null
  created_by: string | null
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const session = await requireRole(["admin", "partner"])
  const { id } = await params
  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from("customers")
    .select("id, name, phone, address, city, notes, created_by")
    .eq("id", id)
    .maybeSingle()
    .returns<CustomerRecord | null>()

  if (error) {
    throw error
  }

  if (!customer) {
    notFound()
  }

  if (
    session.profile.role === "partner" &&
    customer.created_by !== session.user.id
  ) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Edit customer"
        description="Update buyer contact details, address, and relationship notes."
        actions={
          <Button asChild variant="outline">
            <Link href={`/customers/${customer.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customer
            </Link>
          </Button>
        }
      />

      <CustomerForm mode="edit" customer={customer} />
    </div>
  )
}
