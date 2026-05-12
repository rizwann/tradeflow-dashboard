import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TradeFlow Dashboard",
    short_name: "TradeFlow",
    description:
      "Modern inventory, shipment, and FIFO profitability management platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#181c24",
    theme_color: "#181c24",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
