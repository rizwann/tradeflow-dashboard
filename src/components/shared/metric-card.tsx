import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type MetricCardProps = {
  title: string
  value: string
  description?: string
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="border border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>

        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
