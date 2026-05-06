"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createProduct, type ProductActionState } from "./product-actions"
import { productSchema, type ProductFormValues } from "./product-schema"

import { Button } from "@/components/ui/button"
import { FieldErrorInput } from "@/components/forms/field-error-input"

const initialState: ProductActionState = {
  success: false,
  message: "",
}

export function ProductForm() {
  const router = useRouter()

  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState,
  )

  const {
    register,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      sku: "",
      purchase_price_eur: 0,
      exchange_rate: 130,
      suggested_selling_price_bdt: 0,
      image_url: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      router.push("/products")
      router.refresh()
    } else {
      toast.error(state.message)
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-[1.75rem] border border-border/60 bg-card/70 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
        <div className="mb-5 space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Product Setup
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Core product details
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldErrorInput
            label="Product name"
            placeholder="Isana Shower Gel"
            error={errors.name?.message}
            {...register("name")}
          />

          <FieldErrorInput
            label="Brand"
            placeholder="Isana"
            error={errors.brand?.message}
            {...register("brand")}
          />

          <FieldErrorInput
            label="Category"
            placeholder="Personal care"
            error={errors.category?.message}
            {...register("category")}
          />

          <FieldErrorInput
            label="SKU"
            placeholder="ISANA-SG-001"
            error={errors.sku?.message}
            {...register("sku")}
          />

          <FieldErrorInput
            label="Purchase price EUR"
            type="number"
            step="0.01"
            error={errors.purchase_price_eur?.message}
            {...register("purchase_price_eur")}
          />

          <FieldErrorInput
            label="Exchange rate"
            type="number"
            step="0.01"
            error={errors.exchange_rate?.message}
            {...register("exchange_rate")}
          />

          <FieldErrorInput
            label="Suggested selling price BDT"
            type="number"
            step="0.01"
            error={errors.suggested_selling_price_bdt?.message}
            {...register("suggested_selling_price_bdt")}
          />

          <FieldErrorInput
            label="Image URL"
            placeholder="https://..."
            error={errors.image_url?.message}
            {...register("image_url")}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-card/70 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
        <FieldErrorInput
          label="Notes"
          placeholder="Optional notes"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </section>

      <Button type="submit" disabled={isPending} className="h-11 w-full px-5 sm:w-auto">
        {isPending ? "Saving..." : "Save product"}
      </Button>
    </form>
  )
}
