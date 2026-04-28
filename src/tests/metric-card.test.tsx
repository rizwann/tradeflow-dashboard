import { render, screen } from "@testing-library/react"
import { MetricCard } from "@/components/shared/metric-card"

describe("MetricCard", () => {
  it("renders title and value", () => {
    render(<MetricCard title="Total Revenue" value="৳1,000" />)

    expect(screen.getByText("Total Revenue")).toBeInTheDocument()
    expect(screen.getByText("৳1,000")).toBeInTheDocument()
  })

  it("renders description when provided", () => {
    render(
      <MetricCard
        title="Profit"
        value="৳500"
        description="Revenue minus expenses"
      />,
    )

    expect(screen.getByText("Revenue minus expenses")).toBeInTheDocument()
  })
})
