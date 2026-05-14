"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"

type CustomersErrorProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function Error({
  error,
  unstable_retry,
}: CustomersErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load customers"
      message="The customers section hit an unexpected error. Try loading it again."
      action={<Button onClick={() => unstable_retry()}>Try again</Button>}
    />
  )
}
