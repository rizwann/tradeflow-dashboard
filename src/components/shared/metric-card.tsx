import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type MetricCardProps = {
  title: string
  value: string
  description?: string
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="relative isolate overflow-hidden rounded-[1.7rem] border-border/60 bg-card/74">
      <div
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/14 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-accent/12 blur-3xl"
      />

      <CardHeader className="pb-1">
        <CardTitle className="min-w-0 text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="min-w-0 space-y-2">
        <div className="min-w-0 break-words text-[1.4rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[1.7rem] xl:text-[1.92rem]">
          {value}
        </div>

        {description ? (
          <p className="max-w-[26ch] break-words text-[0.78rem] leading-5 text-muted-foreground/92">
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
