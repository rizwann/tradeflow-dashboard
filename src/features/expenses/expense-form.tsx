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
  updateExpense,
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

type ExpenseFormMode = "create" | "edit"

type EditableExpense = {
  id: string
  type: ExpenseFormValues["type"]
  amount: number
  currency: string
  date: string
  shipment_id?: string | null
  notes?: string | null
}

type ExpenseFormProps = {
  mode: ExpenseFormMode
  shipments: ShipmentOption[]
  expense?: EditableExpense
}

const initialState: ExpenseActionState = {
  success: false,
  message: "",
}

export function ExpenseForm({ mode, shipments, expense }: ExpenseFormProps) {
  const router = useRouter()
  const action = mode === "edit" ? updateExpense : createExpense
  const [state, formAction, isPending] = useActionState(
    action,
    initialState,
  )
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<z.input<typeof expenseSchema>, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      type: expense?.type ?? "shipping",
      amount: expense?.amount ?? 0,
      currency: expense?.currency ?? "BDT",
      date: expense?.date ?? "",
      shipment_id: expense?.shipment_id ?? "",
      notes: expense?.notes ?? "",
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
      {mode === "edit" && expense ? (
        <input type="hidden" name="id" value={expense.id} />
      ) : null}

      <section className="surface-panel space-y-5 rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Expense Ledger
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            {mode === "edit"
              ? "Update an operating expense"
              : "Log an operating expense"}
          </h2>
        </div>

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
        </div>

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
      </section>

      <section className="surface-panel rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
        <FieldErrorInput
          label="Notes"
          placeholder="Optional notes"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </section>

      <Button type="submit" disabled={isPending} className="h-11 w-full px-5 sm:w-auto">
        {isPending
          ? mode === "edit"
            ? "Updating expense..."
            : "Adding expense..."
          : mode === "edit"
            ? "Update expense"
            : "Add expense"}
      </Button>
    </form>
  )
}
