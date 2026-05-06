"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isPending?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md rounded-[1.6rem] border border-border/60 bg-card/95 p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_64px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="rounded-b-[1.6rem] border-border/60 bg-muted/35">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
