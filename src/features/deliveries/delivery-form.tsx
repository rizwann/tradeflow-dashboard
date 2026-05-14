"use client"

import {
  useActionState,
  useEffect,
  type ComponentProps,
} from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { z } from "zod"

import {
  FieldErrorInput,
  FieldErrorSelect,
} from "@/components/forms/field-error-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import {
  createOrUpdateDelivery,
  type DeliveryActionState,
} from "./delivery-actions"
import {
  deliverySchema,
  type DeliveryFormValues,
  type DeliveryStatus,
} from "./delivery-schema"

type EditableDelivery = {
  id?: string
  status: DeliveryStatus
  delivery_method?: string | null
  tracking_number?: string | null
  delivery_cost: number
  delivery_cost_paid_by: "business" | "customer"
  shipped_at?: string | null
  delivered_at?: string | null
  notes?: string | null
}

type DeliveryFormProps = {
  saleId: string
  customerId?: string | null
  delivery?: EditableDelivery | null
  onSuccess?: () => void
}

type FieldErrorTextareaProps = ComponentProps<typeof Textarea> & {
  label: string
  error?: string
}

const initialState: DeliveryActionState = {
  success: false,
  message: "",
}

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function FieldErrorTextarea({
  label,
  error,
  id,
  className,
  ...props
}: FieldErrorTextareaProps) {
  const textareaId =
    id ?? String(props.name ?? label.toLowerCase().replaceAll(" ", "-"))
  const errorId = `${textareaId}-error`

  return (
    <div className="min-w-0 space-y-2.5">
      <Label
        htmlFor={textareaId}
        className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <Textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn("min-h-28", className)}
        {...props}
      />
      {error ? (
        <p
          id={errorId}
          className="break-words text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function DeliveryForm({
  saleId,
  customerId,
  delivery,
  onSuccess,
}: DeliveryFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    createOrUpdateDelivery,
    initialState,
  )
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<z.input<typeof deliverySchema>, unknown, DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      sale_id: saleId,
      customer_id: customerId ?? "",
      status: delivery?.status ?? "pending",
      delivery_method: delivery?.delivery_method ?? "",
      tracking_number: delivery?.tracking_number ?? "",
      delivery_cost: delivery?.delivery_cost ?? 0,
      delivery_cost_paid_by: delivery?.delivery_cost_paid_by ?? "business",
      shipped_at: toDateTimeLocalValue(delivery?.shipped_at),
      delivered_at: toDateTimeLocalValue(delivery?.delivered_at),
      notes: delivery?.notes ?? "",
    },
  })

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      router.refresh()
      onSuccess?.()
    } else {
      toast.error(state.message)
    }
  }, [onSuccess, router, state])

  return (
    <form
      action={formAction}
      className="space-y-5"
      noValidate
      onSubmit={async (event) => {
        const isValid = await trigger()

        if (!isValid) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" value={saleId} {...register("sale_id")} />
      <input type="hidden" value={customerId ?? ""} {...register("customer_id")} />

      <div className="grid gap-4 md:grid-cols-2">
        <FieldErrorSelect
          label="Status"
          error={errors.status?.message}
          {...register("status")}
        >
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </FieldErrorSelect>

        <FieldErrorInput
          label="Delivery method"
          placeholder="Pathao / Sundarban / Hand delivery"
          error={errors.delivery_method?.message}
          {...register("delivery_method")}
        />

        <FieldErrorInput
          label="Tracking number"
          placeholder="Optional tracking or rider ID"
          error={errors.tracking_number?.message}
          {...register("tracking_number")}
        />

        <FieldErrorInput
          label="Delivery cost"
          type="number"
          min={0}
          step="0.01"
          error={errors.delivery_cost?.message}
          {...register("delivery_cost")}
        />

        <FieldErrorSelect
          label="Paid by"
          error={errors.delivery_cost_paid_by?.message}
          {...register("delivery_cost_paid_by")}
        >
          <option value="business">Business</option>
          <option value="customer">Customer</option>
        </FieldErrorSelect>

        <FieldErrorInput
          label="Shipped at"
          type="datetime-local"
          error={errors.shipped_at?.message}
          {...register("shipped_at")}
        />

        <FieldErrorInput
          label="Delivered at"
          type="datetime-local"
          error={errors.delivered_at?.message}
          {...register("delivered_at")}
        />
      </div>

      <FieldErrorTextarea
        label="Notes"
        placeholder="Delivery notes, rider instructions, or address context"
        error={errors.notes?.message}
        {...register("notes")}
      />

      <Button type="submit" disabled={isPending} className="h-10 w-full sm:w-auto">
        {isPending
          ? delivery
            ? "Updating delivery..."
            : "Saving delivery..."
          : delivery
            ? "Update delivery"
            : "Save delivery"}
      </Button>
    </form>
  )
}
