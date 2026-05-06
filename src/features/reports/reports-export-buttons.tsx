"use client"

import { ExportButton } from "@/components/shared/export-button"

type ProductProfitExportRow = {
  productName: string
  quantitySold: number
  revenue: number
  landedCostTotal: number
  grossProfit: number
  margin: number
}

type ShipmentProfitExportRow = {
  shipmentCode: string
  totalQuantity: number
  estimatedRevenue: number
  landedCost: number
  grossProfit: number
  margin: number
}

type ReportsExportButtonsProps = {
  productRows: ProductProfitExportRow[]
  shipmentRows: ShipmentProfitExportRow[]
}

export function ReportsExportButtons({
  productRows,
  shipmentRows,
}: ReportsExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ExportButton
        filename="tradeflow-report-product-profit.csv"
        rows={productRows}
        label="Export Product Profit"
        columns={[
          { label: "Product", value: (row) => row.productName },
          { label: "Quantity Sold", value: (row) => row.quantitySold },
          { label: "Revenue", value: (row) => row.revenue },
          { label: "FIFO Cost", value: (row) => row.landedCostTotal },
          { label: "Gross Profit", value: (row) => row.grossProfit },
          { label: "Margin", value: (row) => row.margin },
        ]}
      />
      <ExportButton
        filename="tradeflow-report-shipment-profit.csv"
        rows={shipmentRows}
        label="Export Shipment Profit"
        columns={[
          { label: "Shipment", value: (row) => row.shipmentCode },
          { label: "Total Quantity", value: (row) => row.totalQuantity },
          { label: "Revenue", value: (row) => row.estimatedRevenue },
          { label: "Landed Cost", value: (row) => row.landedCost },
          { label: "Gross Profit", value: (row) => row.grossProfit },
          { label: "Margin", value: (row) => row.margin },
        ]}
      />
    </div>
  )
}
