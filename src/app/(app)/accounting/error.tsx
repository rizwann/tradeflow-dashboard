"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type AccountingErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: AccountingErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load accounting"
      message="The accounting page failed to render. Try rendering it again."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  )
}
