"use client"

import { useDeferredValue, useEffect, useState } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Product = {
  id: string
  name: string
}

type Customer = {
  id: string
  name: string
  phone: string
  city: string | null
}

const initialState: SaleActionState = {
  success: false,
  message: "",
}

function normalizePhone(value: string) {
  return value.replaceAll(/[^+\d]/g, "")
}

export function SaleForm({
  products,
  customers,
}: {
  products: Product[]
  customers: Customer[]
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createSale, initialState)
  const [customerMode, setCustomerMode] = useState<"existing" | "new">(
    customers.length > 0 ? "existing" : "new",
  )
  const [customerSearch, setCustomerSearch] = useState("")
  const deferredCustomerSearch = useDeferredValue(customerSearch)
  const {
    register,
    setValue,
    control,
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
      customer_id: "",
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      customer_city: "",
      payment_status: "paid",
      notes: "",
    },
  })
  const selectedCustomerId = (useWatch({
    control,
    name: "customer_id",
  }) as string | undefined)
  const newCustomerPhone =
    ((useWatch({
      control,
      name: "customer_phone",
    }) as string | undefined) ?? "")

  const filteredCustomers = customers
    .filter((customer) => {
      const query = deferredCustomerSearch.trim().toLowerCase()

      if (!query) return true

      return [customer.name, customer.phone, customer.city ?? ""].some((value) =>
        value.toLowerCase().includes(query),
      )
    })
    .slice(0, 10)

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  )

  const matchingPhoneCustomer =
    customerMode === "new" && newCustomerPhone.trim().length > 0
      ? customers.find(
          (customer) =>
            normalizePhone(customer.phone) === normalizePhone(newCustomerPhone),
        )
      : undefined

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
      <section className="surface-panel space-y-5 rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Revenue Capture
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Record a completed sale
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
              {product.name}
            </option>
          ))}
        </FieldErrorSelect>
      </section>

      <section className="surface-panel space-y-5 rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Customer Link
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Attach this sale to an existing buyer or create one inline
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={cn(
              "surface-panel-subtle rounded-[1.45rem] px-4 py-4 text-left transition-all",
              customerMode === "existing"
                ? "border-primary/40 bg-primary/8 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                : "hover:border-border/80",
            )}
            onClick={() => {
              setCustomerMode("existing")
              setValue("customer_name", "", { shouldValidate: false })
              setValue("customer_phone", "", { shouldValidate: false })
              setValue("customer_address", "", { shouldValidate: false })
              setValue("customer_city", "", { shouldValidate: false })
            }}
            aria-pressed={customerMode === "existing"}
            disabled={customers.length === 0}
          >
            <p className="text-sm font-semibold tracking-[-0.02em]">
              Existing customer
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground/95">
              Search and reuse a saved buyer profile.
            </p>
          </button>

          <button
            type="button"
            className={cn(
              "surface-panel-subtle rounded-[1.45rem] px-4 py-4 text-left transition-all",
              customerMode === "new"
                ? "border-primary/40 bg-primary/8 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                : "hover:border-border/80",
            )}
            onClick={() => {
              setCustomerMode("new")
              setValue("customer_id", "", { shouldValidate: false })
            }}
            aria-pressed={customerMode === "new"}
          >
            <p className="text-sm font-semibold tracking-[-0.02em]">
              New customer
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground/95">
              Create a buyer profile while recording this order.
            </p>
          </button>
        </div>

        <input type="hidden" {...register("customer_id")} />

        {customerMode === "existing" ? (
          <div className="space-y-4">
            <div className="space-y-2.5">
              <label
                htmlFor="customer-search"
                className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
              >
                Search customer
              </label>
              <Input
                id="customer-search"
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder={
                  customers.length === 0
                    ? "No customers saved yet"
                    : "Search by name, phone, or city"
                }
                disabled={customers.length === 0}
              />
              {errors.customer_id?.message ? (
                <p className="break-words text-sm font-medium text-destructive">
                  {errors.customer_id.message}
                </p>
              ) : null}
            </div>

            {customers.length === 0 ? (
              <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-muted/18 px-4 py-4 text-sm text-muted-foreground">
                No customers exist yet. Switch to <span className="font-medium text-foreground">New customer</span> to create one with this sale.
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => {
                    const isSelected = customer.id === selectedCustomerId

                    return (
                      <button
                        key={customer.id}
                        type="button"
                        className={cn(
                          "surface-panel-subtle w-full rounded-[1.35rem] px-4 py-4 text-left transition-all hover:border-border/80",
                          isSelected
                            ? "border-primary/45 bg-primary/8 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                            : "",
                        )}
                        onClick={() => {
                          setValue("customer_id", customer.id, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold tracking-[-0.02em]">
                              {customer.name}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {customer.phone}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase",
                              isSelected
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border/70 text-muted-foreground",
                            )}
                          >
                            {isSelected ? "Linked" : customer.city ?? "Customer"}
                          </span>
                        </div>
                        {customer.city ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {customer.city}
                          </p>
                        ) : null}
                      </button>
                    )
                  })
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-muted/18 px-4 py-4 text-sm text-muted-foreground">
                    No matching customers. Try a different search or switch to
                    new customer mode.
                  </div>
                )}
              </div>
            )}

            {selectedCustomer ? (
              <div className="surface-tile rounded-[1.35rem] px-4 py-4">
                <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Linked Customer
                </p>
                <p className="mt-2 text-sm font-semibold tracking-[-0.02em]">
                  {selectedCustomer.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedCustomer.phone}
                  {selectedCustomer.city ? ` · ${selectedCustomer.city}` : ""}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FieldErrorInput
                label="Customer name"
                required
                placeholder="Rahim Traders"
                error={errors.customer_name?.message}
                {...register("customer_name")}
              />

              <FieldErrorInput
                label="Customer phone"
                required
                placeholder="+8801XXXXXXXXX"
                error={errors.customer_phone?.message}
                {...register("customer_phone")}
              />

              <FieldErrorInput
                label="Customer city"
                placeholder="Dhaka"
                error={errors.customer_city?.message}
                {...register("customer_city")}
              />

              <FieldErrorInput
                label="Customer address"
                placeholder="Road, area, or landmark"
                error={errors.customer_address?.message}
                {...register("customer_address")}
              />
            </div>

            {matchingPhoneCustomer ? (
              <div className="rounded-[1.35rem] border border-amber-300/40 bg-amber-500/10 px-4 py-4 text-sm text-amber-900 dark:text-amber-200">
                Customer already exists: <span className="font-medium">{matchingPhoneCustomer.name}</span>
                {matchingPhoneCustomer.city
                  ? ` · ${matchingPhoneCustomer.city}`
                  : ""}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="surface-panel space-y-5 rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
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
        {isPending ? "Recording sale..." : "Record sale"}
      </Button>
    </form>
  )
}
