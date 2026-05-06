import "@testing-library/jest-dom"
import React from "react"
import { TextDecoder, TextEncoder } from "util"

import { mockRouter, mockSetTheme } from "@/tests/test-utils"

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(global, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(global, "TextEncoder", {
  writable: true,
  value: TextEncoder,
})

Object.defineProperty(global, "TextDecoder", {
  writable: true,
  value: TextDecoder,
})

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

global.URL.createObjectURL = jest.fn(() => "blob:test")
global.URL.revokeObjectURL = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  redirect: jest.fn(),
  notFound: jest.fn(),
}))

jest.mock("next/link", () => {
  return function Link({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return React.createElement("a", { href, ...props }, children)
  }
})

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "system",
    setTheme: mockSetTheme,
  }),
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

afterEach(() => {
  jest.clearAllMocks()
  mockRouter.push.mockReset()
  mockRouter.refresh.mockReset()
  mockRouter.replace.mockReset()
  mockRouter.prefetch.mockReset()
  mockRouter.back.mockReset()
  mockSetTheme.mockReset()
})
