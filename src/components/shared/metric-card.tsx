import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type MetricCardProps = {
  title: string
  value: string
  description?: string
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="border border-border/70 bg-card/92 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur">
      <CardHeader className="pb-1">
        <CardTitle className="min-w-0 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="min-w-0 space-y-2">
        <div className="break-all text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {value}
        </div>

        {description ? (
          <p className="break-words text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
