"use client"

import { ExportButton } from "@/components/shared/export-button"

type SaleExportRow = {
  productName: string
  quantity: number
  unit_selling_price_bdt: number
  discount: number
  revenue: number
  sale_date: string
  payment_status: string
  status: string
  customer_name: string | null
}

export function SalesExportButton({ rows }: { rows: SaleExportRow[] }) {
  return (
    <ExportButton
      filename="tradeflow-sales.csv"
      rows={rows}
      columns={[
        { label: "Product", value: (row) => row.productName },
        { label: "Quantity", value: (row) => row.quantity },
        {
          label: "Unit Selling Price BDT",
          value: (row) => row.unit_selling_price_bdt,
        },
        { label: "Discount", value: (row) => row.discount },
        { label: "Revenue", value: (row) => row.revenue },
        { label: "Sale Date", value: (row) => row.sale_date },
        { label: "Payment Status", value: (row) => row.payment_status },
        { label: "Status", value: (row) => row.status },
        { label: "Customer Name", value: (row) => row.customer_name ?? "" },
      ]}
    />
  )
}
