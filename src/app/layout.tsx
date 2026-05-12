import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/components/providers/theme-provider"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "TradeFlow Dashboard",
    template: "%s | TradeFlow Dashboard",
  },
  description:
    "Modern inventory, shipment, and FIFO profitability management platform.",
  keywords: [
    "inventory management",
    "logistics dashboard",
    "FIFO accounting",
    "ERP analytics",
    "shipment tracking",
    "profitability reporting",
    "supply chain operations",
    "TradeFlow Dashboard",
  ],
  applicationName: "TradeFlow Dashboard",
  referrer: "origin-when-cross-origin",
  openGraph: {
    title: "TradeFlow Dashboard",
    description:
      "Modern inventory, shipment, and FIFO profitability management platform.",
    url: appUrl,
    siteName: "TradeFlow Dashboard",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TradeFlow Dashboard",
    description:
      "Modern inventory, shipment, and FIFO profitability management platform.",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#181c24" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <div className="flex min-h-full flex-col">{children}</div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
