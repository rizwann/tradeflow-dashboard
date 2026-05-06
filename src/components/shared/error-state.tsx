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
    <div className="rounded-[1.75rem] border border-destructive/20 bg-card/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
