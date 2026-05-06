"use client"

import { ExportButton } from "@/components/shared/export-button"

type ExpenseExportRow = {
  type: string
  amount: number
  currency: string
  date: string
  relatedShipment: string
  notes: string
}

export function ExpensesExportButton({ rows }: { rows: ExpenseExportRow[] }) {
  return (
    <ExportButton
      filename="tradeflow-expenses.csv"
      rows={rows}
      columns={[
        { label: "Type", value: (row) => row.type },
        { label: "Amount", value: (row) => row.amount },
        { label: "Currency", value: (row) => row.currency },
        { label: "Date", value: (row) => row.date },
        { label: "Related Shipment", value: (row) => row.relatedShipment },
        { label: "Notes", value: (row) => row.notes },
      ]}
    />
  )
}
