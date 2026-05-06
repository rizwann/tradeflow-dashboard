"use client"

import { ExportButton } from "@/components/shared/export-button"

type ShipmentExportRow = {
  shipment_code: string
  carrier_name: string | null
  method: string
  status: string
  sent_date: string | null
  expected_arrival_date: string | null
  received_date: string | null
  shipping_cost: number
  customs_cost: number
  notes: string | null
}

export function ShipmentsExportButton({ rows }: { rows: ShipmentExportRow[] }) {
  return (
    <ExportButton
      filename="tradeflow-shipments.csv"
      rows={rows}
      columns={[
        { label: "Shipment Code", value: (row) => row.shipment_code },
        { label: "Carrier Name", value: (row) => row.carrier_name ?? "" },
        { label: "Method", value: (row) => row.method },
        { label: "Status", value: (row) => row.status },
        { label: "Sent Date", value: (row) => row.sent_date ?? "" },
        {
          label: "Expected Arrival Date",
          value: (row) => row.expected_arrival_date ?? "",
        },
        { label: "Received Date", value: (row) => row.received_date ?? "" },
        { label: "Shipping Cost", value: (row) => row.shipping_cost },
        { label: "Customs Cost", value: (row) => row.customs_cost },
        { label: "Notes", value: (row) => row.notes ?? "" },
      ]}
    />
  )
}
