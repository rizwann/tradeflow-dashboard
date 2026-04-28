import type { ReactNode } from "react"

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {actions ? <div>{actions}</div> : null}
    </div>
  )
}
