import type { ReactNode } from "react"
import { Inbox } from "lucide-react"

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface-panel-subtle rounded-[1.75rem] border-dashed p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-muted/70 text-muted-foreground">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="font-semibold tracking-[-0.02em]">{title}</h2>

      {description ? (
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground/95">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
