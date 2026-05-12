"use client"

export function downloadCsv(filename: string, csvContent: string) {
  const csvWithBom = `\uFEFF${csvContent}`
  const blob = new Blob([csvWithBom], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  link.style.display = "none"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
