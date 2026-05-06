import { fireEvent, render, screen } from "@testing-library/react"

import { ExportButton } from "@/components/shared/export-button"

jest.mock("@/lib/download", () => ({
  downloadCsv: jest.fn(),
}))

const { downloadCsv } = jest.requireMock("@/lib/download") as {
  downloadCsv: jest.Mock
}

describe("ExportButton", () => {
  beforeEach(() => {
    downloadCsv.mockReset()
  })

  it("disables export when there are no rows", () => {
    render(
      <ExportButton
        filename="empty.csv"
        rows={[]}
        columns={[{ label: "Name", value: (row: { name: string }) => row.name }]}
      />,
    )

    expect(screen.getByRole("button", { name: /export csv/i })).toBeDisabled()
  })

  it("triggers csv download when rows exist", () => {
    render(
      <ExportButton
        filename="test.csv"
        rows={[{ name: "Soap" }]}
        columns={[{ label: "Name", value: (row) => row.name }]}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /export csv/i }))

    expect(downloadCsv).toHaveBeenCalledWith("test.csv", "Name\r\nSoap")
  })
})
