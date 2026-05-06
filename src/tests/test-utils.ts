export const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
}

export const mockSetTheme = jest.fn()

export function resetSharedMocks() {
  mockRouter.push.mockReset()
  mockRouter.refresh.mockReset()
  mockRouter.replace.mockReset()
  mockRouter.prefetch.mockReset()
  mockRouter.back.mockReset()
  mockSetTheme.mockReset()
  ;(global.URL.createObjectURL as jest.Mock).mockClear()
  ;(global.URL.revokeObjectURL as jest.Mock).mockClear()
}
