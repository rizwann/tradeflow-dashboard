"use client"

import { ExportButton } from "@/components/shared/export-button"

type ProductExportRow = {
  name: string
  brand: string
  category: string
  sku: string
  purchase_price_eur: number
  exchange_rate: number
  purchase_price_bdt: number
  suggested_selling_price_bdt: number
  created_at: string | null
}

export function ProductsExportButton({ rows }: { rows: ProductExportRow[] }) {
  return (
    <ExportButton
      filename="tradeflow-products.csv"
      rows={rows}
      columns={[
        { label: "Name", value: (row) => row.name },
        { label: "Brand", value: (row) => row.brand },
        { label: "Category", value: (row) => row.category },
        { label: "SKU", value: (row) => row.sku },
        { label: "Purchase Price EUR", value: (row) => row.purchase_price_eur },
        { label: "Exchange Rate", value: (row) => row.exchange_rate },
        { label: "Purchase Price BDT", value: (row) => row.purchase_price_bdt },
        {
          label: "Suggested Selling Price BDT",
          value: (row) => row.suggested_selling_price_bdt,
        },
        { label: "Created At", value: (row) => row.created_at ?? "" },
      ]}
    />
  )
}
