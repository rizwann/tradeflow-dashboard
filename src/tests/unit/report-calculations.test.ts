import { calculateProductProfit } from "@/features/reports/report-calculations"

describe("report calculations", () => {
  it("calculates product profit rows from fifo cost", () => {
    expect(
      calculateProductProfit([
        {
          productId: "p1",
          productName: "Soap",
          quantitySold: 10,
          revenue: 1000,
          fifoCost: 650,
        },
      ]),
    ).toEqual([
      {
        productId: "p1",
        productName: "Soap",
        quantitySold: 10,
        revenue: 1000,
        fifoCost: 650,
        landedCostTotal: 650,
        grossProfit: 350,
        margin: 35,
      },
    ])
  })

  it("keeps zero-revenue margin at zero", () => {
    expect(
      calculateProductProfit([
        {
          productId: "p2",
          productName: "Sample",
          quantitySold: 0,
          revenue: 0,
          fifoCost: 0,
        },
      ])[0].margin,
    ).toBe(0)
  })
})
