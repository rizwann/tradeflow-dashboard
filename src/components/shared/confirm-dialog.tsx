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
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  isPending?: boolean
  pendingLabel?: string
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  pendingLabel = "Processing...",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-[1.6rem] border border-border/60 bg-card/95 p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_64px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
        <DialogHeader className="min-w-0 px-6 pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children ? (
          <div className="min-w-0 overflow-x-hidden px-6 [&_textarea]:w-full **:data-[slot=input]:w-full">
            {children}
          </div>
        ) : null}

        <DialogFooter className="min-w-0 flex-col-reverse gap-2 rounded-b-[1.6rem] border-border/60 bg-muted/35 sm:flex-row sm:justify-end [&_[data-slot=button]]:w-full [&_[data-slot=button]]:min-w-0 [&_[data-slot=button]]:whitespace-normal sm:[&_[data-slot=button]]:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
