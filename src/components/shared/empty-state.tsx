import type { ReactNode } from "react"

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border bg-background p-8 text-center shadow-sm">
      <h2 className="font-semibold">{title}</h2>

      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
