"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type ReportsErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ReportsErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load reports"
      message="The reports page hit an unexpected error. Try reloading this section."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  )
}
