"use client"

import { startTransition, useState } from "react"
import { Ban } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { voidSale } from "./sale-actions"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { UserRole } from "@/types/app"

type SaleTableActionsProps = {
  saleId: string
  saleStatus: "active" | "voided"
  productName: string
  soldBy: string
  currentUserId: string
  currentUserRole: UserRole
}

export function SaleTableActions({
  saleId,
  saleStatus,
  productName,
  soldBy,
  currentUserId,
  currentUserRole,
}: SaleTableActionsProps) {
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isVoiding, setIsVoiding] = useState(false)
  const [voidReason, setVoidReason] = useState("")

  const canVoid =
    saleStatus === "active" &&
    (currentUserRole === "admin" || soldBy === currentUserId)

  function handleVoid() {
    setIsVoiding(true)

    startTransition(async () => {
      const result = await voidSale(saleId, voidReason)

      if (result.success) {
        toast.success(result.message)
        setIsConfirmOpen(false)
        setVoidReason("")
        router.refresh()
      } else {
        toast.error(result.message)
      }

      setIsVoiding(false)
    })
  }

  if (saleStatus === "voided") {
    return <Badge variant="secondary">Voided</Badge>
  }

  if (!canVoid) {
    return <span className="text-sm text-muted-foreground">No action</span>
  }

  return (
    <ConfirmDialog
      open={isConfirmOpen}
      onOpenChange={(open) => {
        setIsConfirmOpen(open)
        if (!open) {
          setVoidReason("")
        }
      }}
      title="Void sale"
      description={`This will reverse the sale for ${productName}, restore FIFO batch availability, and remove it from active reporting.`}
      confirmLabel="Void sale"
      pendingLabel="Voiding..."
      isPending={isVoiding}
      onConfirm={handleVoid}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Void sale for ${productName}`}
          className="rounded-full border border-border/60 bg-background/70 px-3 text-destructive shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <Ban className="h-4 w-4" />
          Void
        </Button>
      }
    >
      <div className="space-y-2">
        <label
          htmlFor={`void-reason-${saleId}`}
          className="text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
        >
          Void reason
        </label>
        <Textarea
          id={`void-reason-${saleId}`}
          value={voidReason}
          onChange={(event) => setVoidReason(event.target.value)}
          placeholder="Optional. Defaults to 'Voided from sales table'."
          className="min-h-24 rounded-2xl border-border/70 bg-background/80 px-4 py-3"
        />
      </div>
    </ConfirmDialog>
  )
}
