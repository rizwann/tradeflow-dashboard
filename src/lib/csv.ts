export type CsvColumn<T> = {
  label: string
  value: (row: T) => unknown
}

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return ""
  }

  const stringValue = String(value)

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

export function convertToCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(",")
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(","),
  )

  return [header, ...body].join("\r\n")
}
