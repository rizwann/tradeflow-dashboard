import type { ReactNode } from "react"

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="surface-panel relative flex flex-col gap-6 bg-card/62 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/75 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-primary/12 blur-3xl"
      />
      <div className="relative min-w-0 space-y-2.5">
        <p className="eyebrow-label">
          TradeFlow Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl lg:text-[2.3rem]">
          {title}
        </h1>

        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground/95 sm:text-[0.98rem]">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="relative flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center [&>*]:w-full sm:[&>*]:w-auto [&_[data-slot=button]]:h-10 [&_[data-slot=button]]:w-full sm:[&_[data-slot=button]]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
