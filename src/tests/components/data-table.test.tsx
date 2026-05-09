import { fireEvent, render, screen } from "@testing-library/react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { SortableHeader } from "@/components/shared/sortable-header"

type Row = {
  name: string
  sku: string
  status: string
}

const rows: Row[] = [
  { name: "Soap", sku: "SKU-1", status: "active" },
  { name: "Shampoo", sku: "SKU-2", status: "voided" },
]

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
  },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "status", header: "Status" },
]

describe("DataTable", () => {
  it("renders rows and sortable headers", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        searchPlaceholder="Search rows..."
      />,
    )

    expect(screen.getByText("Soap")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sort by name/i })).toBeInTheDocument()
    expect(screen.getByRole("table")).toBeInTheDocument()
  })

  it("shows empty state when no data is provided", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyTitle="No rows"
        emptyDescription="Nothing to show."
      />,
    )

    expect(screen.getByText("No rows")).toBeInTheDocument()
  })

  it("filters rows from global search and shows no-match message", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        searchPlaceholder="Search rows..."
      />,
    )

    fireEvent.change(screen.getByRole("textbox", { name: "Search rows..." }), {
      target: { value: "Shampoo" },
    })
    expect(screen.queryByText("Soap")).not.toBeInTheDocument()
    expect(screen.getByText("Shampoo")).toBeInTheDocument()

    fireEvent.change(screen.getByRole("textbox", { name: "Search rows..." }), {
      target: { value: "Missing" },
    })
    expect(screen.getByText("No matching results")).toBeInTheDocument()
  })

  it("renders mobile cards from the filtered row model when a renderer is provided", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        searchPlaceholder="Search rows..."
        mobileCardRenderer={(row) => (
          <article aria-label={`mobile-card-${row.name}`}>{row.name}</article>
        )}
      />,
    )

    expect(
      screen.getByLabelText("mobile-card-Soap"),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByRole("textbox", { name: "Search rows..." }), {
      target: { value: "Shampoo" },
    })

    expect(
      screen.queryByLabelText("mobile-card-Soap"),
    ).not.toBeInTheDocument()
    expect(
      screen.getByLabelText("mobile-card-Shampoo"),
    ).toBeInTheDocument()
  })
})
