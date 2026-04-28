import { render, screen } from "@testing-library/react"
import { StatusBadge } from "@/components/shared/status-badge"

describe("StatusBadge", () => {
  it("renders healthy status", () => {
    render(<StatusBadge status="healthy" />)

    expect(screen.getByText("Healthy")).toBeInTheDocument()
  })

  it("renders low stock status", () => {
    render(<StatusBadge status="low" />)

    expect(screen.getByText("Low stock")).toBeInTheDocument()
  })

  it("renders out of stock status", () => {
    render(<StatusBadge status="out" />)

    expect(screen.getByText("Out of stock")).toBeInTheDocument()
  })
})
