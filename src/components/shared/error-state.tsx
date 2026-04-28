type ErrorStateProps = {
  title?: string
  message?: string
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please refresh the page or try again later.",
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
