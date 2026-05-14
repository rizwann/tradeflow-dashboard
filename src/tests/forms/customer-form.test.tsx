jest.mock("react", () => {
  const actual = jest.requireActual("react")

  return {
    ...actual,
    useActionState: jest.fn(() => [
      { success: false, message: "" },
      jest.fn(),
      false,
    ]),
  }
})

import { fireEvent, render, screen } from "@testing-library/react"

import { CustomerForm } from "@/features/customers/customer-form"

jest.mock("@/features/customers/customer-actions", () => ({
  createCustomer: jest.fn(),
  updateCustomer: jest.fn(),
}))

describe("CustomerForm", () => {
  it("shows required field validation on submit", async () => {
    render(<CustomerForm mode="create" />)

    fireEvent.click(screen.getByRole("button", { name: "Save customer" }))

    expect(await screen.findByText("Name is required")).toBeInTheDocument()
    expect(await screen.findByText("Phone is required")).toBeInTheDocument()
  })

  it("renders edit defaults and update button", () => {
    render(
      <CustomerForm
        mode="edit"
        customer={{
          id: "cust-1",
          name: "Rahim Traders",
          phone: "+8801712345678",
          address: "Banani, Dhaka",
          city: "Dhaka",
          notes: "Repeat buyer",
        }}
      />,
    )

    expect(screen.getByDisplayValue("Rahim Traders")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Update customer" })).toBeInTheDocument()
  })
})
