import {
  calculateCustomerDetailInsights,
  calculateCustomerInsights,
  calculateDeliveryInsights,
  calculateLeastSellingProducts,
} from "@/features/analytics/customer-delivery-analytics"

describe("customer and delivery analytics", () => {
  it("calculates customer insights with leaderboard and retention", () => {
    const insights = calculateCustomerInsights({
      customers: [
        { id: "c1", name: "Ayesha", createdAt: "2026-05-03T10:00:00.000Z" },
        { id: "c2", name: "Bashar", createdAt: "2026-04-02T10:00:00.000Z" },
        { id: "c3", name: "Chowdhury", createdAt: null },
      ],
      sales: [
        {
          id: "s1",
          customerId: "c1",
          customerName: "Ayesha",
          productId: "p1",
          productName: "Soap",
          quantity: 2,
          unitSellingPriceBdt: 300,
          discount: 50,
          saleDate: "2026-05-10T00:00:00.000Z",
        },
        {
          id: "s2",
          customerId: "c1",
          customerName: "Ayesha",
          productId: "p2",
          productName: "Cream",
          quantity: 1,
          unitSellingPriceBdt: 500,
          discount: 0,
          saleDate: "2026-05-11T00:00:00.000Z",
        },
        {
          id: "s3",
          customerId: "c2",
          customerName: "Bashar",
          productId: "p1",
          productName: "Soap",
          quantity: 1,
          unitSellingPriceBdt: 400,
          discount: 0,
          saleDate: "2026-05-08T00:00:00.000Z",
        },
      ],
      saleProfits: [
        { saleId: "s1", grossProfit: 180 },
        { saleId: "s2", grossProfit: 200 },
        { saleId: "s3", grossProfit: 90 },
      ],
      referenceDate: new Date("2026-05-18T12:00:00.000Z"),
    })

    expect(insights.newCustomersThisMonth).toBe(1)
    expect(insights.returningCustomers).toBe(1)
    expect(insights.averageOrderValue).toBeCloseTo(483.33, 2)
    expect(insights.retentionRate).toBeCloseTo(33.33, 2)
    expect(insights.bestCustomerByRevenue?.customerName).toBe("Ayesha")
    expect(insights.bestCustomerByRevenue?.revenue).toBe(1050)
    expect(insights.bestCustomerByProfit?.profit).toBe(380)
    expect(insights.topCustomers[0]?.lastOrderDate).toBe("2026-05-11T00:00:00.000Z")
  })

  it("calculates delivery completion and cost metrics", () => {
    const insights = calculateDeliveryInsights([
      {
        status: "pending",
        deliveryCost: 120,
        deliveryCostPaidBy: "business",
      },
      {
        status: "shipped",
        deliveryCost: 100,
        deliveryCostPaidBy: "customer",
      },
      {
        status: "delivered",
        deliveryCost: 80,
        deliveryCostPaidBy: "business",
      },
      {
        status: "cancelled",
        deliveryCost: 200,
        deliveryCostPaidBy: "customer",
      },
    ])

    expect(insights.pendingDeliveries).toBe(1)
    expect(insights.deliveredDeliveries).toBe(1)
    expect(insights.cancelledDeliveries).toBe(1)
    expect(insights.completionRate).toBeCloseTo(33.33, 2)
    expect(insights.businessPaidDeliveryCost).toBe(200)
    expect(insights.averageDeliveryCost).toBe(100)
    expect(insights.customerPaidDeliveryPercentage).toBe(50)
  })

  it("returns least-selling products with revenue and no zero-sales rows", () => {
    const rows = calculateLeastSellingProducts({
      products: [
        { id: "p1", name: "Soap", sku: "SOAP-1" },
        { id: "p2", name: "Cream", sku: "CRM-1" },
        { id: "p3", name: "Serum", sku: "SRM-1" },
      ],
      sales: [
        {
          id: "s1",
          customerId: "c1",
          customerName: "Ayesha",
          productId: "p1",
          productName: "Soap",
          quantity: 5,
          unitSellingPriceBdt: 100,
          discount: 0,
          saleDate: "2026-05-10T00:00:00.000Z",
        },
        {
          id: "s2",
          customerId: "c1",
          customerName: "Ayesha",
          productId: "p2",
          productName: "Cream",
          quantity: 1,
          unitSellingPriceBdt: 200,
          discount: 25,
          saleDate: "2026-05-11T00:00:00.000Z",
        },
      ],
    })

    expect(rows).toEqual([
      {
        productId: "p2",
        productName: "Cream",
        sku: "CRM-1",
        quantitySold: 1,
        revenue: 175,
      },
      {
        productId: "p1",
        productName: "Soap",
        sku: "SOAP-1",
        quantitySold: 5,
        revenue: 500,
      },
    ])
  })

  it("calculates customer detail KPIs", () => {
    const insights = calculateCustomerDetailInsights({
      sales: [
        {
          id: "s1",
          customerId: "c1",
          customerName: "Ayesha",
          productId: "p1",
          productName: "Soap",
          quantity: 2,
          unitSellingPriceBdt: 300,
          discount: 0,
          saleDate: "2026-05-12T00:00:00.000Z",
        },
        {
          id: "s2",
          customerId: "c1",
          customerName: "Ayesha",
          productId: "p1",
          productName: "Soap",
          quantity: 1,
          unitSellingPriceBdt: 300,
          discount: 50,
          saleDate: "2026-05-17T00:00:00.000Z",
        },
        {
          id: "s3",
          customerId: "c1",
          customerName: "Ayesha",
          productId: "p2",
          productName: "Cream",
          quantity: 1,
          unitSellingPriceBdt: 450,
          discount: 0,
          saleDate: "2026-05-10T00:00:00.000Z",
        },
      ],
      deliveries: [
        {
          status: "delivered",
          deliveryCost: 120,
          deliveryCostPaidBy: "business",
        },
        {
          status: "pending",
          deliveryCost: 80,
          deliveryCostPaidBy: "customer",
        },
        {
          status: "cancelled",
          deliveryCost: 70,
          deliveryCostPaidBy: "customer",
        },
      ],
    })

    expect(insights.deliveredOrders).toBe(1)
    expect(insights.pendingDeliveries).toBe(1)
    expect(insights.totalDeliverySpend).toBe(200)
    expect(insights.averageOrderValue).toBeCloseTo(433.33, 2)
    expect(insights.favoriteProduct).toEqual({
      productName: "Soap",
      quantitySold: 3,
      ordersCount: 2,
    })
    expect(insights.lastOrderDate).toBe("2026-05-17T00:00:00.000Z")
  })
})
