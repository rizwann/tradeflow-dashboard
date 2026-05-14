"use client"

import { useEffect, useActionState, type ComponentProps } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { z } from "zod"

import { FieldErrorInput } from "@/components/forms/field-error-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import {
  createCustomer,
  type CustomerActionState,
  updateCustomer,
} from "./customer-actions"
import {
  customerSchema,
  type CustomerFormValues,
} from "./customer-schema"

type CustomerFormMode = "create" | "edit"

type EditableCustomer = {
  id: string
  name: string
  phone: string
  address?: string | null
  city?: string | null
  notes?: string | null
}

type CustomerFormProps = {
  mode: CustomerFormMode
  customer?: EditableCustomer
}

type FieldErrorTextareaProps = ComponentProps<typeof Textarea> & {
  label: string
  error?: string
}

const initialState: CustomerActionState = {
  success: false,
  message: "",
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

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  const router = useRouter()
  const action = mode === "edit" ? updateCustomer : createCustomer
  const [state, formAction, isPending] = useActionState(action, initialState)
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<z.input<typeof customerSchema>, unknown, CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      address: customer?.address ?? "",
      city: customer?.city ?? "",
      notes: customer?.notes ?? "",
    },
  })

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      router.push("/customers")
      router.refresh()
    } else {
      toast.error(state.message)
    }
  }, [router, state])

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      onSubmit={async (event) => {
        const isValid = await trigger()

        if (!isValid) {
          event.preventDefault()
        }
      }}
    >
      {mode === "edit" && customer ? (
        <input type="hidden" name="id" value={customer.id} />
      ) : null}

      <section className="surface-panel space-y-5 rounded-[1.85rem] bg-card/72 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Customer Directory
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            {mode === "edit"
              ? "Update customer profile"
              : "Create a customer profile"}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldErrorInput
            label="Customer name"
            required
            placeholder="Rahim Traders"
            error={errors.name?.message}
            {...register("name")}
          />

          <FieldErrorInput
            label="Phone"
            required
            placeholder="+8801XXXXXXXXX"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <FieldErrorInput
            label="City"
            placeholder="Dhaka"
            error={errors.city?.message}
            {...register("city")}
          />
        </div>

        <FieldErrorTextarea
          label="Address"
          placeholder="House, road, area, or delivery landmark"
          error={errors.address?.message}
          {...register("address")}
        />
      </section>

      <section className="surface-panel rounded-[1.85rem] bg-card/72 p-5 sm:p-6">
        <FieldErrorTextarea
          label="Notes"
          placeholder="Preferences, delivery notes, or relationship context"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </section>

      <Button type="submit" disabled={isPending} className="h-11 w-full px-5 sm:w-auto">
        {isPending
          ? mode === "edit"
            ? "Updating customer..."
            : "Saving customer..."
          : mode === "edit"
            ? "Update customer"
            : "Save customer"}
      </Button>
    </form>
  )
}
