"use client"

import { useDeferredValue, useEffect, useState } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
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
  sku: string
  suggested_selling_price_bdt: number
  bangladeshStock?: number
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

function formatBDT(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`
}

function createEmptyItem() {
  return {
    product_id: "",
    quantity: 1,
    unit_selling_price_bdt: 0,
    discount: 0,
  }
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
  const productById = new Map(products.map((product) => [product.id, product]))

  const {
    register,
    setValue,
    getValues,
    control,
    trigger,
    formState: { errors },
  } = useForm<z.input<typeof saleSchema>, unknown, SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sale_date: "",
      customer_id: "",
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      customer_city: "",
      payment_status: "paid",
      notes: "",
      items: [createEmptyItem()],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
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
  const watchedItems =
    (useWatch({
      control,
      name: "items",
    }) as SaleFormValues["items"] | undefined) ?? []

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

  const totals = watchedItems.reduce(
    (summary, item) => {
      const quantity = Number(item?.quantity ?? 0)
      const unitPrice = Number(item?.unit_selling_price_bdt ?? 0)
      const discount = Number(item?.discount ?? 0)
      const lineSubtotal = quantity * unitPrice
      const lineRevenue = lineSubtotal - discount

      return {
        subtotal: summary.subtotal + lineSubtotal,
        discount: summary.discount + discount,
        revenue: summary.revenue + lineRevenue,
      }
    },
    {
      subtotal: 0,
      discount: 0,
      revenue: 0,
    },
  )

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
            Customer Link
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Attach this order to an existing buyer or create one inline
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
                No customers exist yet. Switch to{" "}
                <span className="font-medium text-foreground">New customer</span>{" "}
                to create one with this order.
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
                Customer already exists:{" "}
                <span className="font-medium">{matchingPhoneCustomer.name}</span>
                {matchingPhoneCustomer.city
                  ? ` · ${matchingPhoneCustomer.city}`
                  : ""}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="surface-panel space-y-5 rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Order Details
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Sale date, payment state, and notes
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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

        <FieldErrorInput
          label="Notes"
          placeholder="Optional notes"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </section>

      <section className="surface-panel space-y-5 rounded-[1.75rem] bg-card/72 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Order Items
            </p>
            <h2 className="text-lg font-semibold tracking-tight">
              Add one or more products to this sale
            </h2>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[1.2rem]"
            onClick={() => append(createEmptyItem())}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Button>
        </div>

        {typeof errors.items?.message === "string" ? (
          <p className="break-words text-sm font-medium text-destructive">
            {errors.items.message}
          </p>
        ) : null}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const itemErrors = errors.items?.[index]
            const watchedItem = watchedItems[index]
            const selectedProduct = watchedItem?.product_id
              ? productById.get(watchedItem.product_id)
              : undefined
            const lineSubtotal =
              Number(watchedItem?.quantity ?? 0) *
              Number(watchedItem?.unit_selling_price_bdt ?? 0)
            const lineRevenue = lineSubtotal - Number(watchedItem?.discount ?? 0)
            const productField = register(`items.${index}.product_id`)

            return (
              <div
                key={field.id}
                className="surface-panel-subtle rounded-[1.5rem] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.02em]">
                      Product line {index + 1}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Quantity, price, discount, and line total for this item.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-[1rem] px-3 text-muted-foreground"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.8fr))_minmax(0,0.9fr)]">
                  <div className="space-y-2.5">
                    <FieldErrorSelect
                      label={`Product ${index + 1}`}
                      error={itemErrors?.product_id?.message}
                      {...productField}
                      onChange={(event) => {
                        productField.onChange(event)

                        const nextProduct = productById.get(event.target.value)
                        const currentPrice = Number(
                          getValues(`items.${index}.unit_selling_price_bdt`) ?? 0,
                        )

                        if (
                          nextProduct &&
                          (!Number.isFinite(currentPrice) || currentPrice <= 0)
                        ) {
                          setValue(
                            `items.${index}.unit_selling_price_bdt`,
                            nextProduct.suggested_selling_price_bdt ?? 0,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          )
                        }
                      }}
                    >
                      <option value="" disabled>
                        Select a product
                      </option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {[
                            product.name,
                            product.sku,
                            `Suggested ${formatBDT(
                              product.suggested_selling_price_bdt,
                            )}`,
                            typeof product.bangladeshStock === "number"
                              ? `BD stock ${product.bangladeshStock.toLocaleString("en-US")}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </option>
                      ))}
                    </FieldErrorSelect>

                    {selectedProduct ? (
                      <p className="text-xs text-muted-foreground">
                        {selectedProduct.sku}
                        {" · "}
                        Suggested {formatBDT(selectedProduct.suggested_selling_price_bdt)}
                        {typeof selectedProduct.bangladeshStock === "number"
                          ? ` · BD stock ${selectedProduct.bangladeshStock.toLocaleString("en-US")}`
                          : ""}
                      </p>
                    ) : null}
                  </div>

                  <FieldErrorInput
                    label="Quantity"
                    type="number"
                    min={1}
                    step="1"
                    required
                    error={itemErrors?.quantity?.message}
                    {...register(`items.${index}.quantity`)}
                  />

                  <FieldErrorInput
                    label="Unit price BDT"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    error={itemErrors?.unit_selling_price_bdt?.message}
                    {...register(`items.${index}.unit_selling_price_bdt`)}
                  />

                  <FieldErrorInput
                    label="Discount"
                    type="number"
                    min={0}
                    step="0.01"
                    error={itemErrors?.discount?.message}
                    {...register(`items.${index}.discount`)}
                  />

                  <div className="space-y-2.5">
                    <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      Line total
                    </p>
                    <div
                      className={cn(
                        "surface-tile rounded-[1.15rem] px-4 py-3",
                        lineRevenue < 0 ? "border-destructive/40" : "",
                      )}
                    >
                      <p className="text-base font-semibold tracking-[-0.02em]">
                        {formatBDT(lineRevenue)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatBDT(lineSubtotal)} subtotal
                        {" · "}
                        {formatBDT(Number(watchedItem?.discount ?? 0))} discount
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="surface-tile grid gap-4 rounded-[1.5rem] px-4 py-4 sm:grid-cols-3">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Subtotal
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              {formatBDT(totals.subtotal)}
            </p>
          </div>
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Total discount
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              {formatBDT(totals.discount)}
            </p>
          </div>
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Total revenue
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              {formatBDT(totals.revenue)}
            </p>
          </div>
        </div>
      </section>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full px-5 sm:w-auto"
      >
        {isPending ? "Recording sale..." : "Record sale"}
      </Button>
    </form>
  )
}
