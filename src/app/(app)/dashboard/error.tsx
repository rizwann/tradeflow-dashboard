"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type DashboardErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load dashboard"
      message="The dashboard failed to render. Try reloading this section."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  )
}
