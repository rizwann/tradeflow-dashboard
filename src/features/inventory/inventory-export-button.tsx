"use client"

import { ExportButton } from "@/components/shared/export-button"

import type { InventoryRow } from "./inventory-table"

export function InventoryExportButton({ rows }: { rows: InventoryRow[] }) {
  return (
    <ExportButton
      filename="tradeflow-inventory.csv"
      rows={rows}
      columns={[
        { label: "Product", value: (row) => row.productName },
        { label: "SKU", value: (row) => row.sku },
        { label: "Germany", value: (row) => row.germany },
        { label: "In Transit", value: (row) => row.inTransit },
        { label: "Bangladesh", value: (row) => row.bangladesh },
        { label: "Total", value: (row) => row.total },
      ]}
    />
  )
}
