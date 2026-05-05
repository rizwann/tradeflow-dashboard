"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type ShipmentsErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ShipmentsErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load shipments"
      message="The shipments page hit an unexpected error. Try rendering it again."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  )
}
