"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"

import {
  createExpense,
  type ExpenseActionState,
} from "./expense-actions"
import {
  expenseSchema,
  type ExpenseFormValues,
} from "./expense-schema"

import { Button } from "@/components/ui/button"
import {
  FieldErrorInput,
  FieldErrorSelect,
} from "@/components/forms/field-error-input"

type ShipmentOption = {
  id: string
  shipment_code: string
}

type ExpenseFormProps = {
  shipments: ShipmentOption[]
}

const initialState: ExpenseActionState = {
  success: false,
  message: "",
}

export function ExpenseForm({ shipments }: ExpenseFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    createExpense,
    initialState,
  )
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<z.input<typeof expenseSchema>, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      type: "shipping",
      amount: 0,
      currency: "BDT",
      date: "",
      shipment_id: undefined,
      notes: undefined,
    },
  })

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      router.push("/expenses")
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
        <FieldErrorSelect
          label="Expense type"
          required
          error={errors.type?.message}
          {...register("type")}
        >
          <option value="shipping">Shipping</option>
          <option value="customs">Customs</option>
          <option value="packaging">Packaging</option>
          <option value="marketing">Marketing</option>
          <option value="delivery">Delivery</option>
          <option value="other">Other</option>
        </FieldErrorSelect>

        <FieldErrorInput
          label="Amount"
          type="number"
          step="0.01"
          min={0}
          required
          error={errors.amount?.message}
          {...register("amount")}
        />

        <FieldErrorSelect
          label="Currency"
          error={errors.currency?.message}
          {...register("currency")}
        >
          <option value="BDT">BDT</option>
          <option value="EUR">EUR</option>
        </FieldErrorSelect>

        <FieldErrorInput
          label="Date"
          type="date"
          required
          error={errors.date?.message}
          {...register("date")}
        />

        <div className="md:col-span-2">
          <FieldErrorSelect
            label="Related shipment"
            error={errors.shipment_id?.message}
            defaultValue=""
            {...register("shipment_id")}
          >
            <option value="">No shipment</option>
            {shipments.map((shipment) => (
              <option key={shipment.id} value={shipment.id}>
                {shipment.shipment_code}
              </option>
            ))}
          </FieldErrorSelect>
        </div>
      </div>

      <FieldErrorInput
        label="Notes"
        placeholder="Optional notes"
        error={errors.notes?.message}
        {...register("notes")}
      />

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Adding expense..." : "Add expense"}
      </Button>
    </form>
  )
}
