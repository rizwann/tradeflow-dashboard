"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"

import { FieldErrorSelect } from "@/components/forms/field-error-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { UserRole } from "@/types/app"

import {
  type InventoryActionState,
  adjustInventory,
} from "./inventory-actions"
import {
  inventoryAdjustmentSchema,
  type InventoryAdjustmentFormValues,
} from "./inventory-adjustment-schema"

type ProductOption = {
  id: string
  name: string
  sku: string
}

type InventoryAdjustmentFormProps = {
  products: ProductOption[]
  currentUserRole: UserRole
}

const initialState: InventoryActionState = {
  success: false,
  message: "",
}

export function InventoryAdjustmentForm({
  products,
  currentUserRole,
}: InventoryAdjustmentFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    adjustInventory,
    initialState,
  )
  const {
    control,
    register,
    trigger,
    formState: { errors },
  } = useForm<
    z.input<typeof inventoryAdjustmentSchema>,
    unknown,
    InventoryAdjustmentFormValues
  >({
    resolver: zodResolver(inventoryAdjustmentSchema),
    defaultValues: {
      product_id: products[0]?.id ?? "",
      location: currentUserRole === "partner" ? "bangladesh" : "germany",
      adjustment_type: "increase",
      quantity: 1,
      reason: "",
    },
  })

  const selectedLocation = useWatch({
    control,
    name: "location",
  })

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      router.push("/inventory")
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
      <section className="space-y-5 rounded-[1.75rem] border border-border/60 bg-card/70 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Inventory Control
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Record a stock correction
          </h2>
        </div>

        <FieldErrorSelect
          label="Product"
          required
          error={errors.product_id?.message}
          {...register("product_id")}
        >
          <option value="" disabled>
            Select a product
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </FieldErrorSelect>

        <div className="grid gap-4 md:grid-cols-2">
          {currentUserRole === "partner" ? (
            <input type="hidden" value="bangladesh" {...register("location")} />
          ) : null}

          <FieldErrorSelect
            label="Location"
            required
            error={errors.location?.message}
            disabled={currentUserRole === "partner"}
            {...register("location")}
          >
            {currentUserRole === "admin" ? (
              <>
                <option value="germany">Germany</option>
                <option value="in_transit">In transit</option>
                <option value="bangladesh">Bangladesh</option>
              </>
            ) : (
              <option value="bangladesh">Bangladesh</option>
            )}
          </FieldErrorSelect>

          <FieldErrorSelect
            label="Adjustment type"
            required
            error={errors.adjustment_type?.message}
            {...register("adjustment_type")}
          >
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
            <option value="set">Set exact quantity</option>
          </FieldErrorSelect>

          <div className="md:col-span-2">
            <div className="space-y-2.5">
              <Label
                htmlFor="quantity"
                className="text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
              >
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                step="1"
                aria-invalid={Boolean(errors.quantity)}
                aria-describedby={errors.quantity ? "quantity-error" : undefined}
                {...register("quantity")}
              />
              {errors.quantity ? (
                <p
                  id="quantity-error"
                  className="break-words text-sm font-medium text-destructive"
                >
                  {errors.quantity.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {selectedLocation === "bangladesh" ? (
          <div className="rounded-2xl border border-amber-300/50 bg-amber-100/50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Manual Bangladesh stock changes may affect FIFO cost accuracy. Use
            only for real stock corrections.
          </div>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-card/70 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
        <div className="space-y-2.5">
          <Label
            htmlFor="reason"
            className="text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
          >
            Reason
          </Label>
          <Textarea
            id="reason"
            aria-invalid={Boolean(errors.reason)}
            aria-describedby={errors.reason ? "reason-error" : undefined}
            placeholder="Explain the stock correction"
            className="min-h-24 rounded-2xl border-border/70 bg-background/80 px-4 py-3"
            {...register("reason")}
          />
          {errors.reason ? (
            <p
              id="reason-error"
              className="break-words text-sm font-medium text-destructive"
            >
              {errors.reason.message}
            </p>
          ) : null}
        </div>
      </section>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full px-5 sm:w-auto"
      >
        {isPending ? "Saving adjustment..." : "Save adjustment"}
      </Button>
    </form>
  )
}
