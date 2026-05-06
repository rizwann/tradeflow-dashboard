import type { ReactNode } from "react"
import { Inbox } from "lucide-react"

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/70 p-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-muted/70 text-muted-foreground">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="font-semibold tracking-tight">{title}</h2>

      {description ? (
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
