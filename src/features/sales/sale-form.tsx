"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"

import { createSale, type SaleActionState } from "./sale-actions"
import { saleSchema, type SaleFormValues } from "./sale-schema"

import { Button } from "@/components/ui/button"
import {
  FieldErrorInput,
  FieldErrorSelect,
} from "@/components/forms/field-error-input"

type Product = {
  id: string
  name: string
}

const initialState: SaleActionState = {
  success: false,
  message: "",
}

export function SaleForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createSale, initialState)
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<z.input<typeof saleSchema>, unknown, SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      product_id: products[0]?.id ?? "",
      quantity: 1,
      unit_selling_price_bdt: 0,
      discount: 0,
      sale_date: "",
      customer_name: "",
      payment_status: "paid",
      notes: "",
    },
  })

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      router.push("/sales")
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
            {product.name}
          </option>
        ))}
      </FieldErrorSelect>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldErrorInput
          label="Quantity sold"
          type="number"
          min={1}
          required
          error={errors.quantity?.message}
          {...register("quantity")}
        />

        <FieldErrorInput
          label="Unit selling price BDT"
          type="number"
          step="0.01"
          min={0}
          required
          error={errors.unit_selling_price_bdt?.message}
          {...register("unit_selling_price_bdt")}
        />

        <FieldErrorInput
          label="Discount"
          type="number"
          step="0.01"
          min={0}
          error={errors.discount?.message}
          {...register("discount")}
        />

        <FieldErrorInput
          label="Sale date"
          type="date"
          required
          error={errors.sale_date?.message}
          {...register("sale_date")}
        />

        <FieldErrorSelect
          label="Payment status"
          error={errors.payment_status?.message}
          {...register("payment_status")}
        >
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </FieldErrorSelect>

        <FieldErrorInput
          label="Customer name"
          placeholder="Optional"
          error={errors.customer_name?.message}
          {...register("customer_name")}
        />
      </div>

      <FieldErrorInput
        label="Notes"
        placeholder="Optional notes"
        error={errors.notes?.message}
        {...register("notes")}
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Recording sale..." : "Record sale"}
      </Button>
    </form>
  )
}
