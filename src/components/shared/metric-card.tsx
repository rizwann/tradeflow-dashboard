import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type MetricCardProps = {
  title: string
  value: string
  description?: string
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="relative isolate overflow-hidden rounded-[1.6rem] border-border/50 bg-card/72 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_44px_rgba(15,23,42,0.07)]">
      <div
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/12 blur-3xl"
      />

      <CardHeader className="pb-1">
        <CardTitle className="min-w-0 text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="min-w-0 space-y-2">
        <div className="min-w-0 break-words text-[1.35rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[1.6rem] xl:text-[1.8rem]">
          {value}
        </div>

        {description ? (
          <p className="break-words text-[0.78rem] leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
