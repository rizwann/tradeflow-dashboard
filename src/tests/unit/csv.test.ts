import { convertToCsv } from "@/lib/csv"

describe("convertToCsv", () => {
  it("includes a header row and plain values", () => {
    const csv = convertToCsv(
      [{ name: "Soap", qty: 2 }],
      [
        { label: "Name", value: (row) => row.name },
        { label: "Quantity", value: (row) => row.qty },
      ],
    )

    expect(csv).toBe("Name,Quantity\r\nSoap,2")
  })

  it("escapes commas, quotes, and newlines", () => {
    const csv = convertToCsv(
      [{ note: 'Large, "fragile"\nitem' }],
      [{ label: "Note", value: (row) => row.note }],
    )

    expect(csv).toBe('Note\r\n"Large, ""fragile""\nitem"')
  })
})
