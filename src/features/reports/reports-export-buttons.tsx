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

type CustomerPerformanceExportRow = {
  customerName: string
  ordersCount: number
  revenue: number
  profit: number
  averageOrderValue: number
  lastOrderDate: string | null
}

type DeliveryPerformanceExportRow = {
  status: string
  deliveryCost: number
  deliveryCostPaidBy: string
}

type ReportsExportButtonsProps = {
  productRows: ProductProfitExportRow[]
  shipmentRows: ShipmentProfitExportRow[]
  customerRows: CustomerPerformanceExportRow[]
  deliveryRows: DeliveryPerformanceExportRow[]
}

export function ReportsExportButtons({
  productRows,
  shipmentRows,
  customerRows,
  deliveryRows,
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
      <ExportButton
        filename="tradeflow-report-customer-performance.csv"
        rows={customerRows}
        label="Export Customer Performance"
        columns={[
          { label: "Customer", value: (row) => row.customerName },
          { label: "Orders Count", value: (row) => row.ordersCount },
          { label: "Revenue", value: (row) => row.revenue },
          { label: "Profit", value: (row) => row.profit },
          { label: "Average Order Value", value: (row) => row.averageOrderValue },
          { label: "Last Order Date", value: (row) => row.lastOrderDate ?? "" },
        ]}
      />
      <ExportButton
        filename="tradeflow-report-delivery-performance.csv"
        rows={deliveryRows}
        label="Export Delivery Performance"
        columns={[
          { label: "Status", value: (row) => row.status },
          { label: "Delivery Cost", value: (row) => row.deliveryCost },
          { label: "Paid By", value: (row) => row.deliveryCostPaidBy },
        ]}
      />
    </div>
  )
}
