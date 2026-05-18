"use client"

import { ExportButton } from "@/components/shared/export-button"

type CustomerExportRow = {
  name: string
  phone: string
  city: string | null
  address: string | null
  ordersCount: number
  totalRevenue: number
  totalProfit: number
  lastOrderDate: string | null
  createdAt: string | null
  notes: string | null
}

export function CustomersExportButton({
  rows,
}: {
  rows: CustomerExportRow[]
}) {
  return (
    <ExportButton
      filename="tradeflow-customers.csv"
      rows={rows}
      columns={[
        { label: "Name", value: (row) => row.name },
        { label: "Phone", value: (row) => row.phone },
        { label: "City", value: (row) => row.city ?? "" },
        { label: "Address", value: (row) => row.address ?? "" },
        { label: "Orders Count", value: (row) => row.ordersCount },
        { label: "Total Revenue BDT", value: (row) => row.totalRevenue },
        { label: "Total Profit BDT", value: (row) => row.totalProfit },
        { label: "Last Order Date", value: (row) => row.lastOrderDate ?? "" },
        { label: "Created At", value: (row) => row.createdAt ?? "" },
        { label: "Notes", value: (row) => row.notes ?? "" },
      ]}
    />
  )
}
