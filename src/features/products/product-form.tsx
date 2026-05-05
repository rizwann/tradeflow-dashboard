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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

      <FieldErrorInput
        label="Notes"
        placeholder="Optional notes"
        error={errors.notes?.message}
        {...register("notes")}
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save product"}
      </Button>
    </form>
  )
}

type FieldErrorInputProps = React.ComponentProps<typeof Input> & {
  label: string
  error?: string
}

function FieldErrorInput({ label, error, id, ...props }: FieldErrorInputProps) {
  const inputId =
    id ?? String(props.name ?? label.toLowerCase().replaceAll(" ", "-"))

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} aria-invalid={Boolean(error)} {...props} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
