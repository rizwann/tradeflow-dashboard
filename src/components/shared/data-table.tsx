"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  emptyTitle?: string
  emptyDescription?: string
  tableClassName?: string
  mobileCardRenderer?: (row: TData) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  emptyTitle = "No results",
  emptyDescription = "There is no data to display.",
  tableClassName = "min-w-[42rem]",
  mobileCardRenderer,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  const hasSearchQuery = globalFilter.trim().length > 0
  const visibleRows = table.getRowModel().rows
  const showMobileCards = Boolean(mobileCardRenderer)
  const noMatchingResults = visibleRows.length === 0

  return (
    <div className="space-y-4">
      {searchKey ? (
        <div className="surface-panel-subtle flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              aria-label={searchPlaceholder}
              className="w-full pl-10"
            />
          </div>

          <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
            {table.getFilteredRowModel().rows.length} rows
          </p>
        </div>
      ) : null}

      {showMobileCards ? (
        <>
          <div className="grid gap-3 md:hidden">
            {noMatchingResults ? (
              <EmptyState
                title="No matching results"
                description={
                  hasSearchQuery
                    ? "Try a different search term or clear the current filter."
                    : "There are no rows to display in the current view."
                }
              />
            ) : (
              visibleRows.map((row) => (
                <div key={row.id} className="min-w-0">
                  {mobileCardRenderer?.(row.original)}
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block">
            <div className="surface-panel overflow-hidden">
              <div className="overflow-x-auto">
                <Table className={tableClassName}>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>

                  <TableBody>
                    {noMatchingResults ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-40 px-6 text-center"
                        >
                          <div className="space-y-2">
                            <p className="font-semibold tracking-[-0.02em]">
                              No matching results
                            </p>
                            <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground/95">
                              {hasSearchQuery
                                ? "Try a different search term or clear the current filter."
                                : "There are no rows to display in the current view."}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table className={tableClassName}>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {noMatchingResults ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-40 px-6 text-center"
                    >
                      <div className="space-y-2">
                        <p className="font-semibold tracking-[-0.02em]">
                          No matching results
                        </p>
                        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground/95">
                          {hasSearchQuery
                            ? "Try a different search term or clear the current filter."
                            : "There are no rows to display in the current view."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
