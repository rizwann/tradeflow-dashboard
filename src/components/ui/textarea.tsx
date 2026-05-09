import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[1.15rem] border border-input/80 bg-background/72 px-4 py-3 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_24px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,background-color] duration-150 outline-none placeholder:text-muted-foreground/88 focus-visible:border-ring focus-visible:bg-background/94 focus-visible:ring-4 focus-visible:ring-ring/18 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/34 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_14px_30px_rgba(0,0,0,0.18)] dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/30",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
