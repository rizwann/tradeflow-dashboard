import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { CustomerForm } from "@/features/customers/customer-form"
import { requireRole } from "@/lib/auth"

export const metadata: Metadata = {
  title: "New Customer",
}

export default async function NewCustomerPage() {
  await requireRole(["admin", "partner"])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Add customer"
        description="Store buyer details for repeat sales and delivery tracking."
        actions={
          <Button asChild variant="outline">
            <Link href="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Link>
          </Button>
        }
      />

      <CustomerForm mode="create" />
    </div>
  )
}
