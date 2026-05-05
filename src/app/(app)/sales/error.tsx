"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type SalesErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: SalesErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load sales"
      message="The sales page could not be rendered. Try reloading this section."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  )
}
