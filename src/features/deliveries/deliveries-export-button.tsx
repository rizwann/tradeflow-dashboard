"use client"

import { ExportButton } from "@/components/shared/export-button"

type DeliveryExportRow = {
  customerName: string
  customerPhone: string | null
  productName: string
  saleDate: string
  status: string
  deliveryMethod: string | null
  trackingNumber: string | null
  deliveryCost: number
  deliveryCostPaidBy: string
  shippedAt: string | null
  deliveredAt: string | null
}

export function DeliveriesExportButton({
  rows,
}: {
  rows: DeliveryExportRow[]
}) {
  return (
    <ExportButton
      filename="tradeflow-deliveries.csv"
      rows={rows}
      columns={[
        { label: "Customer", value: (row) => row.customerName },
        { label: "Customer Phone", value: (row) => row.customerPhone ?? "" },
        { label: "Product", value: (row) => row.productName },
        { label: "Sale Date", value: (row) => row.saleDate },
        { label: "Status", value: (row) => row.status },
        { label: "Delivery Method", value: (row) => row.deliveryMethod ?? "" },
        { label: "Tracking Number", value: (row) => row.trackingNumber ?? "" },
        { label: "Delivery Cost", value: (row) => row.deliveryCost },
        { label: "Paid By", value: (row) => row.deliveryCostPaidBy },
        { label: "Shipped At", value: (row) => row.shippedAt ?? "" },
        { label: "Delivered At", value: (row) => row.deliveredAt ?? "" },
      ]}
    />
  )
}
