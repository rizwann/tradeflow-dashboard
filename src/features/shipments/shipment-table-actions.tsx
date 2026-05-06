"use client"

import Link from "next/link"
import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, PencilLine, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteShipment } from "./shipment-actions"
import { ShipmentStatusActions } from "./shipment-status-actions"
import type { ShipmentStatus } from "./shipment-table"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types/app"

type ShipmentTableActionsProps = {
  shipmentId: string
  shipmentCode: string
  status: ShipmentStatus
  currentUserRole: UserRole
}

export function ShipmentTableActions({
  shipmentId,
  shipmentCode,
  status,
  currentUserRole,
}: ShipmentTableActionsProps) {
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const canManageDraft = currentUserRole === "admin" && status === "draft"

  function handleDelete() {
    setIsDeleting(true)

    startTransition(async () => {
      const result = await deleteShipment(shipmentId)

      if (result.success) {
        toast.success(result.message)
        setIsConfirmOpen(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }

      setIsDeleting(false)
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
      >
        <Link
          href={`/shipments/${shipmentId}`}
          aria-label={`View shipment ${shipmentCode}`}
        >
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      <ShipmentStatusActions shipmentId={shipmentId} status={status} />

      {canManageDraft ? (
        <>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            <Link
              href={`/shipments/${shipmentId}/edit`}
              aria-label={`Edit draft shipment ${shipmentCode}`}
            >
              <PencilLine className="h-4 w-4" />
            </Link>
          </Button>

          <ConfirmDialog
            open={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            title="Delete draft shipment"
            description="Only draft shipments can be deleted. This permanently removes the shipment and all of its shipment items, and the action cannot be undone."
            confirmLabel="Delete shipment"
            isPending={isDeleting}
            onConfirm={handleDelete}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete draft shipment ${shipmentCode}`}
                className="h-9 w-9 rounded-full border border-border/60 bg-background/70 text-destructive shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </>
      ) : null}
    </div>
  )
}
