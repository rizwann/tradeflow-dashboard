"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type ExpensesErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ExpensesErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load expenses"
      message="The expenses page failed to render. Try rendering it again."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  )
}
