"use client"

import Link from "next/link"
import { PencilLine } from "lucide-react"
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

const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Product" />,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
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
      <div className="text-right">
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
    />
  )
}
