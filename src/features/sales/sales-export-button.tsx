"use client"

import { ExportButton } from "@/components/shared/export-button"

type SaleExportRow = {
  items_summary: string
  item_count: number
  total_quantity: number
  total_revenue: number
  sale_date: string
  payment_status: string
  status: string
  customer_name: string | null
  customer_phone: string | null
  delivery_status: string | null
  delivery_cost: number | null
  delivery_cost_paid_by: string | null
}

export function SalesExportButton({ rows }: { rows: SaleExportRow[] }) {
  return (
    <ExportButton
      filename="tradeflow-sales.csv"
      rows={rows}
      columns={[
        { label: "Items Summary", value: (row) => row.items_summary },
        { label: "Item Count", value: (row) => row.item_count },
        { label: "Total Quantity", value: (row) => row.total_quantity },
        { label: "Total Revenue", value: (row) => row.total_revenue },
        { label: "Customer Name", value: (row) => row.customer_name ?? "" },
        { label: "Customer Phone", value: (row) => row.customer_phone ?? "" },
        { label: "Payment Status", value: (row) => row.payment_status },
        { label: "Delivery Status", value: (row) => row.delivery_status ?? "" },
        { label: "Sale Status", value: (row) => row.status },
        { label: "Sale Date", value: (row) => row.sale_date },
        { label: "Delivery Cost", value: (row) => row.delivery_cost ?? "" },
        {
          label: "Delivery Cost Paid By",
          value: (row) => row.delivery_cost_paid_by ?? "",
        },
      ]}
    />
  )
}
