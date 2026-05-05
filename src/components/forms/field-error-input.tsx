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
    <div className="min-w-0 space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
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
    <div className="min-w-0 space-y-2">
      <Label htmlFor={selectId}>{label}</Label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-10 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-sm shadow-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
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
