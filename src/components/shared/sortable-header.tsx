"use client"

import { ArrowUpDown } from "lucide-react"
import type { Column } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

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
  return (
    <Button
      variant="ghost"
      className={align === "right" ? "ml-auto px-0" : "-ml-4"}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}
