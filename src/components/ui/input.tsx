import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[1.15rem] border border-border/70 bg-background/72 px-4 py-2 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_24px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,background-color,transform] duration-150 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/88 focus-visible:border-ring focus-visible:bg-background/94 focus-visible:ring-4 focus-visible:ring-ring/18 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 md:text-sm dark:bg-input/34 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_14px_30px_rgba(0,0,0,0.18)] dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
