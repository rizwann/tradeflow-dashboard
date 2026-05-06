"use client"

import type { ComponentProps } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FieldErrorInputProps = ComponentProps<typeof Input> & {
  label: string
  error?: string
}

type FieldErrorSelectProps = ComponentProps<"select"> & {
  label: string
  error?: string
}

export function FieldErrorInput({
  label,
  error,
  id,
  className,
  ...props
}: FieldErrorInputProps) {
  const inputId =
    id ?? String(props.name ?? label.toLowerCase().replaceAll(" ", "-"))
  const errorId = `${inputId}-error`

  return (
    <div className="min-w-0 space-y-2.5">
      <Label
        htmlFor={inputId}
        className="text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <Input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn("w-full min-w-0", className)}
        {...props}
      />
      {error ? (
        <p
          id={errorId}
          className="break-words text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function FieldErrorSelect({
  label,
  error,
  id,
  className,
  children,
  ...props
}: FieldErrorSelectProps) {
  const selectId =
    id ?? String(props.name ?? label.toLowerCase().replaceAll(" ", "-"))
  const errorId = `${selectId}-error`

  return (
    <div className="min-w-0 space-y-2.5">
      <Label
        htmlFor={selectId}
        className="text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-11 w-full min-w-0 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:shadow-[0_1px_2px_rgba(0,0,0,0.24),0_12px_28px_rgba(0,0,0,0.18)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p
          id={errorId}
          className="break-words text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
