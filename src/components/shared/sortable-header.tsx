"use client"

import { ArrowUpDown } from "lucide-react"
import type { Column } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SortableHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  align?: "left" | "right"
}

export function SortableHeader<TData, TValue>({
  column,
  title,
  align = "left",
}: SortableHeaderProps<TData, TValue>) {
  const sortState = column.getIsSorted()

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "h-9 rounded-xl px-2 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground sm:h-8",
        align === "right" ? "ml-auto justify-end" : "-ml-2 sm:-ml-4",
      )}
      aria-label={`Sort by ${title}${sortState ? `, currently ${sortState}` : ""}`}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown
        className={cn(
          "ml-2 h-4 w-4 opacity-70 transition-transform",
          sortState === "asc" ? "rotate-180" : "",
        )}
      />
    </Button>
  )
}
