"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type PurchasesErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: PurchasesErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load purchases"
      message="The purchases page failed to render. Try running it again."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  )
}
