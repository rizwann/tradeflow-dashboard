"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { Ban, PackageCheck, PencilLine, Plus, Truck } from "lucide-react"
import { toast } from "sonner"

import {
  cancelDelivery,
  markDeliveryDelivered,
  markDeliveryShipped,
} from "./delivery-actions"
import { DeliveryForm } from "./delivery-form"
import type { DeliveryCostPaidBy, DeliveryStatus } from "./delivery-schema"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type DeliveryDraft = {
  id: string
  status: DeliveryStatus
  delivery_method: string | null
  tracking_number: string | null
  delivery_cost: number
  delivery_cost_paid_by: DeliveryCostPaidBy
  shipped_at: string | null
  delivered_at: string | null
  notes: string | null
}

type DeliveryTableActionsProps = {
  saleId: string
  saleStatus: "active" | "voided"
  customerId: string | null
  customerName: string
  canManage: boolean
  delivery?: DeliveryDraft | null
  triggerLabel?: string
}

export function DeliveryTableActions({
  saleId,
  saleStatus,
  customerId,
  customerName,
  canManage,
  delivery,
  triggerLabel,
}: DeliveryTableActionsProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  if (saleStatus === "voided") {
    return <span className="text-sm text-muted-foreground">Sale voided</span>
  }

  if (!canManage) {
    return <span className="text-sm text-muted-foreground">No action</span>
  }

  function runAction(
    action: (deliveryId: string) => Promise<{ success: boolean; message: string }>,
  ) {
    if (!delivery) return

    setIsPending(true)

    startTransition(async () => {
      const result = await action(delivery.id)

      if (result.success) {
        toast.success(result.message)
        setIsCancelOpen(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }

      setIsPending(false)
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full border border-border/60 bg-background/70 px-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            aria-label={`${delivery ? "Edit" : "Add"} delivery for ${customerName}`}
          >
            {delivery ? (
              <PencilLine className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {triggerLabel ?? (delivery ? "Manage delivery" : "Add delivery")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {delivery ? "Manage delivery" : "Create delivery"}
            </DialogTitle>
            <DialogDescription>
              Track fulfilment progress, delivery cost, and courier details for
              this sale.
            </DialogDescription>
          </DialogHeader>
          <DeliveryForm
            saleId={saleId}
            customerId={customerId}
            delivery={delivery}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {delivery ? (
        <>
          {delivery.status === "pending" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="h-9 rounded-full px-3"
              onClick={() => runAction(markDeliveryShipped)}
            >
              <Truck className="mr-2 h-4 w-4" />
              Mark shipped
            </Button>
          ) : null}

          {(delivery.status === "pending" || delivery.status === "shipped") ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="h-9 rounded-full px-3"
              onClick={() => runAction(markDeliveryDelivered)}
            >
              <PackageCheck className="mr-2 h-4 w-4" />
              Mark delivered
            </Button>
          ) : null}

          {delivery.status !== "delivered" && delivery.status !== "cancelled" ? (
            <ConfirmDialog
              open={isCancelOpen}
              onOpenChange={setIsCancelOpen}
              title="Cancel delivery"
              description="This keeps the delivery record for audit history but marks it as cancelled."
              confirmLabel="Cancel delivery"
              pendingLabel="Cancelling..."
              isPending={isPending}
              onConfirm={() => runAction(cancelDelivery)}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-border/60 bg-background/70 px-3 text-destructive shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              }
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
