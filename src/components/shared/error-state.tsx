import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

type ErrorStateProps = {
  title?: string
  message?: string
  action?: ReactNode
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please refresh the page or try again later.",
  action,
}: ErrorStateProps) {
  return (
    <div className="surface-panel rounded-[1.75rem] border-destructive/20 bg-card/82 p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground/95">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
