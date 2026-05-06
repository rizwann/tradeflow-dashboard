"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { startTransition, useState } from "react"
import { PencilLine, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteExpense } from "./expense-actions"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"

type ExpenseTableActionsProps = {
  expenseId: string
  expenseType: string
  canEdit: boolean
  canDelete: boolean
}

export function ExpenseTableActions({
  expenseId,
  expenseType,
  canEdit,
  canDelete,
}: ExpenseTableActionsProps) {
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!canEdit && !canDelete) {
    return null
  }

  function handleDelete() {
    setIsDeleting(true)

    startTransition(async () => {
      const result = await deleteExpense(expenseId)

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
    <div className="flex items-center justify-end gap-2">
      {canEdit ? (
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Link
            href={`/expenses/${expenseId}/edit`}
            aria-label={`Edit ${expenseType} expense`}
          >
            <PencilLine className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}

      {canDelete ? (
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          title="Delete expense"
          description="This permanently removes the expense record. Inventory, FIFO, and operational history calculations are not otherwise adjusted."
          confirmLabel="Delete expense"
          isPending={isDeleting}
          onConfirm={handleDelete}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Delete ${expenseType} expense`}
              className="h-9 w-9 rounded-full border border-border/60 bg-background/70 text-destructive shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        />
      ) : null}
    </div>
  )
}
