import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"

function ConfirmDialogHarness({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button type="button">Open</Button>}
      title="Delete row"
      description="This cannot be undone."
      onConfirm={onConfirm}
    />
  )
}

describe("shared components", () => {
  it("renders metric, page, empty, error, and loading states", () => {
    const { container } = render(
      <div>
        <MetricCard title="Revenue" value="৳100" description="Today" />
        <PageHeader
          title="Products"
          description="Manage products"
          actions={<Button type="button">Action</Button>}
        />
        <EmptyState title="Nothing here" description="Add data" />
        <ErrorState title="Could not load" message="Try again later." />
        <LoadingState />
      </div>,
    )

    expect(screen.getByText("Revenue")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument()
    expect(screen.getByText("Nothing here")).toBeInTheDocument()
    expect(screen.getByText("Could not load")).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it("renders stock badges", () => {
    render(
      <div>
        <StatusBadge status="healthy" />
        <StatusBadge status="low" />
        <StatusBadge status="out" />
      </div>,
    )

    expect(screen.getByText("Healthy")).toBeInTheDocument()
    expect(screen.getByText("Low stock")).toBeInTheDocument()
    expect(screen.getByText("Out of stock")).toBeInTheDocument()
  })

  it("opens confirm dialog and calls confirm callback", () => {
    const onConfirm = jest.fn()

    render(<ConfirmDialogHarness onConfirm={onConfirm} />)

    fireEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("renders theme toggle accessibly", () => {
    render(<ThemeToggle />)

    expect(
      screen.getByRole("button", {
        name: /change theme\. current theme: system/i,
      }),
    ).toBeInTheDocument()
  })
})
