"use client"

import { ExportButton } from "@/components/shared/export-button"

type PurchaseExportRow = {
  productName: string
  quantity: number
  unit_cost_eur: number
  exchange_rate: number
  total_cost_bdt: number
  purchase_date: string
  notes: string | null
}

export function PurchasesExportButton({ rows }: { rows: PurchaseExportRow[] }) {
  return (
    <ExportButton
      filename="tradeflow-purchases.csv"
      rows={rows}
      columns={[
        { label: "Product", value: (row) => row.productName },
        { label: "Quantity", value: (row) => row.quantity },
        { label: "Unit Cost EUR", value: (row) => row.unit_cost_eur },
        { label: "Exchange Rate", value: (row) => row.exchange_rate },
        { label: "Total Cost BDT", value: (row) => row.total_cost_bdt },
        { label: "Purchase Date", value: (row) => row.purchase_date },
        { label: "Notes", value: (row) => row.notes ?? "" },
      ]}
    />
  )
}
