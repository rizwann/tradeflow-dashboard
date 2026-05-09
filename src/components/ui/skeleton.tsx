import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-xl bg-[linear-gradient(90deg,color-mix(in_oklab,var(--muted)_88%,transparent),color-mix(in_oklab,var(--background)_80%,transparent),color-mix(in_oklab,var(--muted)_88%,transparent))]",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
