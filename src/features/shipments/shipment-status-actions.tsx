import { markShipmentAsReceived, markShipmentAsSent } from "./shipment-actions"
import { Button } from "@/components/ui/button"

type ShipmentStatus =
  | "draft"
  | "sent"
  | "in_transit"
  | "received"
  | "lost_damaged"

type ShipmentStatusActionsProps = {
  shipmentId: string
  status: ShipmentStatus
}

export function ShipmentStatusActions({
  shipmentId,
  status,
}: ShipmentStatusActionsProps) {
  if (status === "draft") {
    return (
      <form action={markShipmentAsSent.bind(null, shipmentId)}>
        <Button size="sm" variant="outline">
          Mark as sent
        </Button>
      </form>
    )
  }

  if (status === "sent") {
    return (
      <form action={markShipmentAsReceived.bind(null, shipmentId)}>
        <Button size="sm" variant="outline">
          Mark as received
        </Button>
      </form>
    )
  }

  return null
}
