"use client"

import { Download } from "lucide-react"

import { convertToCsv, type CsvColumn } from "@/lib/csv"
import { downloadCsv } from "@/lib/download"

import { Button } from "@/components/ui/button"

type ExportButtonProps<T> = {
  filename: string
  rows: T[]
  columns: CsvColumn<T>[]
  label?: string
}

export function ExportButton<T>({
  filename,
  rows,
  columns,
  label = "Export CSV",
}: ExportButtonProps<T>) {
  function handleExport() {
    const csvContent = convertToCsv(rows, columns)
    downloadCsv(filename, csvContent)
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={rows.length === 0}
      aria-label={`${label} for ${filename}`}
      className="h-10 w-full sm:w-auto"
    >
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
