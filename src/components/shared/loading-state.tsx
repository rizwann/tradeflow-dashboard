import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="space-y-3">
        <Skeleton className="h-9 w-56 max-w-full" />
        <Skeleton className="h-4 w-[32rem] max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="surface-panel p-5"
          >
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="surface-panel p-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>

        <div className="surface-panel p-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-[1.6fr_0.8fr] gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
