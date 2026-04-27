import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Product = {
  id: string
  name: string
  brand: string
  category: string
  sku: string
  purchase_price_eur: number
  purchase_price_bdt: number
  suggested_selling_price_bdt: number
}

type ProductTableProps = {
  products: Product[]
}

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border bg-background p-8 text-center">
        <h2 className="font-semibold">No products yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first product to start tracking inventory.
        </p>

        <Button asChild className="mt-4">
          <Link href="/products/new">Add product</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Cost EUR</TableHead>
            <TableHead className="text-right">Cost BDT</TableHead>
            <TableHead className="text-right">Sell BDT</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.brand}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell className="text-right">
                €{product.purchase_price_eur}
              </TableCell>
              <TableCell className="text-right">
                ৳{product.purchase_price_bdt}
              </TableCell>
              <TableCell className="text-right">
                ৳{product.suggested_selling_price_bdt}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
