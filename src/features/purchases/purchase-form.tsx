"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"

import {
  createPurchase,
  type PurchaseActionState,
} from "./purchase-actions"
import {
  purchaseSchema,
  type PurchaseFormValues,
} from "./purchase-schema"

import { Button } from "@/components/ui/button"
import {
  FieldErrorInput,
  FieldErrorSelect,
} from "@/components/forms/field-error-input"

type Product = {
  id: string
  name: string
}

const initialState: PurchaseActionState = {
  success: false,
  message: "",
}

export function PurchaseForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    createPurchase,
    initialState,
  )

  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<z.input<typeof purchaseSchema>, unknown, PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      product_id: products[0]?.id ?? "",
      quantity: 1,
      unit_cost_eur: 0,
      exchange_rate: 130,
      purchase_date: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      router.push("/purchases")
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
      <section className="surface-panel space-y-5 rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Procurement
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Record incoming stock
          </h2>
        </div>

        <FieldErrorSelect
          label="Product"
          error={errors.product_id?.message}
          {...register("product_id")}
        >
          <option value="" disabled>
            Select a product
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </FieldErrorSelect>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldErrorInput
            label="Quantity"
            type="number"
            required
            error={errors.quantity?.message}
            {...register("quantity")}
          />

          <FieldErrorInput
            label="Unit cost EUR"
            type="number"
            step="0.01"
            required
            error={errors.unit_cost_eur?.message}
            {...register("unit_cost_eur")}
          />

          <FieldErrorInput
            label="Exchange rate"
            type="number"
            step="0.01"
            required
            error={errors.exchange_rate?.message}
            {...register("exchange_rate")}
          />

          <FieldErrorInput
            label="Purchase date"
            type="date"
            required
            error={errors.purchase_date?.message}
            {...register("purchase_date")}
          />
        </div>
      </section>

      <section className="surface-panel rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
        <FieldErrorInput
          label="Notes"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </section>

      <Button type="submit" disabled={isPending} className="h-11 w-full px-5 sm:w-auto">
        {isPending ? "Recording purchase..." : "Record purchase"}
      </Button>
    </form>
  )
}
