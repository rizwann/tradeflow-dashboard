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

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn("w-full min-w-0", className)}
        {...props}
      />
      {error ? (
        <p className="break-words text-sm text-destructive">{error}</p>
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

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={selectId}>{label}</Label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full min-w-0 rounded-md border bg-background p-2 text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="break-words text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
