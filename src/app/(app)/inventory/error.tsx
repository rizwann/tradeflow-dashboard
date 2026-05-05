"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type InventoryErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: InventoryErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load inventory"
      message="The inventory view could not be rendered. Try reloading this section."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  )
}
