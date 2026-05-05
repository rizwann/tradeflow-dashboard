"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"

import {
  createShipment,
  type ShipmentActionState,
} from "./shipment-actions"
import {
  shipmentFormSchema,
  type ShipmentFormValues,
} from "./shipment-schema"

import { Button } from "@/components/ui/button"
import {
  FieldErrorInput,
  FieldErrorSelect,
} from "@/components/forms/field-error-input"

type Product = {
  id: string
  name: string
}

export function ShipmentForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    createShipment,
    initialState,
  )
  const {
    control,
    register,
    trigger,
    formState: { errors },
  } = useForm<
    z.input<typeof shipmentFormSchema>,
    unknown,
    ShipmentFormValues
  >({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      shipment_code: "",
      carrier_name: "",
      method: "luggage",
      sent_date: "",
      expected_arrival_date: "",
      shipping_cost: 0,
      customs_cost: 0,
      notes: undefined,
      items: [
        {
          product_id: products[0]?.id ?? "",
          quantity: 1,
        },
      ],
    },
  })
  const { fields, append } = useFieldArray({
    control,
    name: "items",
  })

  const addItem = () => {
    append({
      product_id: products[0]?.id ?? "",
      quantity: 1,
    })
  }

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      router.push("/shipments")
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
      <div className="grid gap-4 md:grid-cols-2">
        <FieldErrorInput
          label="Shipment code"
          required
          error={errors.shipment_code?.message}
          {...register("shipment_code")}
        />

        <FieldErrorSelect
          label="Method"
          error={errors.method?.message}
          {...register("method")}
        >
          <option value="luggage">Luggage</option>
          <option value="courier">Courier</option>
          <option value="cargo">Cargo</option>
        </FieldErrorSelect>

        <FieldErrorInput
          label="Shipping cost"
          type="number"
          step="0.01"
          error={errors.shipping_cost?.message}
          {...register("shipping_cost")}
        />

        <FieldErrorInput
          label="Customs cost"
          type="number"
          step="0.01"
          error={errors.customs_cost?.message}
          {...register("customs_cost")}
        />

        <FieldErrorInput
          label="Carrier name"
          placeholder="DHL, luggage, cargo agent..."
          error={errors.carrier_name?.message}
          {...register("carrier_name")}
        />

        <FieldErrorInput
          label="Sent date"
          type="date"
          error={errors.sent_date?.message}
          {...register("sent_date")}
        />

        <FieldErrorInput
          label="Expected arrival date"
          type="date"
          error={errors.expected_arrival_date?.message}
          {...register("expected_arrival_date")}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Items</p>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 md:border-0 md:p-0"
          >
            <FieldErrorSelect
              label={`Product ${index + 1}`}
              error={errors.items?.[index]?.product_id?.message}
              {...register(`items.${index}.product_id`)}
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

            <FieldErrorInput
              label={`Quantity ${index + 1}`}
              type="number"
              error={errors.items?.[index]?.quantity?.message}
              {...register(`items.${index}.quantity`)}
            />
          </div>
        ))}

        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          className="mt-1 w-full sm:w-auto"
        >
          Add item
        </Button>

        {errors.items?.message ? (
          <p className="break-words text-sm text-destructive">
            {errors.items.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Creating shipment..." : "Create shipment"}
      </Button>
    </form>
  )
}

const initialState: ShipmentActionState = {
  success: false,
  message: "",
}
