"use client"

import Link from "next/link"
import { Eye, PencilLine } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"
import { EmptyState } from "@/components/shared/empty-state"

export type ProductRow = {
  id: string
  name: string
  brand: string
  category: string
  sku: string
  purchase_price_eur: number
  purchase_price_bdt: number
  suggested_selling_price_bdt: number
}

function formatEUR(value: number) {
  return `€${Number(value).toFixed(2)}`
}

function formatBDT(value: number) {
  return `৳${Math.round(Number(value)).toLocaleString("en-US")}`
}

function ProductMobileCard({ product }: { product: ProductRow }) {
  return (
    <div className="surface-panel-subtle rounded-[1.45rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/products/${product.id}`}
            className="block font-semibold tracking-[-0.02em] transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">{product.sku}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)]"
          >
            <Link
              href={`/products/${product.id}`}
              aria-label={`View product ${product.name}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)]"
          >
            <Link
              href={`/products/${product.id}/edit`}
              aria-label={`Edit product ${product.name}`}
            >
              <PencilLine className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Brand / Category
          </p>
          <p className="mt-2 text-sm font-medium">
            {product.brand} · {product.category}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Cost BDT
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatBDT(product.purchase_price_bdt)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Cost EUR
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatEUR(product.purchase_price_eur)}
          </p>
        </div>
        <div className="surface-tile px-3 py-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Sell BDT
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatBDT(product.suggested_selling_price_bdt)}
          </p>
        </div>
      </div>
    </div>
  )
}

const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Product" />,
    cell: ({ row }) => (
      <div>
        <Link
          href={`/products/${row.original.id}`}
          className="font-medium transition-colors hover:text-primary"
        >
          {row.original.name}
        </Link>
        <p className="text-xs text-muted-foreground">{row.original.sku}</p>
      </div>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => row.original.sku,
  },
  {
    accessorKey: "brand",
    header: ({ column }) => <SortableHeader column={column} title="Brand" />,
  },
  {
    accessorKey: "category",
    header: ({ column }) => <SortableHeader column={column} title="Category" />,
  },
  {
    accessorKey: "purchase_price_eur",
    header: ({ column }) => (
      <SortableHeader column={column} title="Cost EUR" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {formatEUR(row.original.purchase_price_eur)}
      </div>
    ),
  },
  {
    accessorKey: "purchase_price_bdt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Cost BDT" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {formatBDT(row.original.purchase_price_bdt)}
      </div>
    ),
  },
  {
    accessorKey: "suggested_selling_price_bdt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Sell BDT" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {formatBDT(row.original.suggested_selling_price_bdt)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Link
            href={`/products/${row.original.id}`}
            aria-label={`View product ${row.original.name}`}
          >
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-border/60 bg-background/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Link
            href={`/products/${row.original.id}/edit`}
            aria-label={`Edit product ${row.original.name}`}
          >
            <PencilLine className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    ),
  },
]

type ProductTableProps = {
  products: ProductRow[]
}

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Add your first product to start tracking inventory."
        action={
          <Button asChild>
            <Link href="/products/new">Add product</Link>
          </Button>
        }
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={products}
      searchKey="name"
      searchPlaceholder="Search products by name, SKU, brand, or category..."
      emptyTitle="No products found"
      emptyDescription="Try adjusting your search."
      mobileCardRenderer={(product) => <ProductMobileCard product={product} />}
    />
  )
}
