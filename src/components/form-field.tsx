import { useId } from "react"
import { cn } from "cn"

import Check from "@/assets/icons/check.svg?react"
import ErrorIcon from "@/assets/icons/error.svg?react"

type FormFieldProps = React.ComponentProps<"input"> & {
  label: string
  /** Shown under the field; turns the label, text and border red. */
  error?: string
  /** Valid and touched — shows the green check. */
  success?: boolean
}

/**
 * Labelled text input with the Figma Input states (263:3550): default,
 * hover, focused, filled, error and success. Spread `register("name")` into
 * it — React 19 passes `ref` through as an ordinary prop.
 */
export const FormField = ({ label, error, success, className, id, ...props }: FormFieldProps) => {
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  const errorId = `${inputId}-error`

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex flex-col gap-2.5">
        <label
          htmlFor={inputId}
          className={cn("type-label-s", error ? "text-primary" : "text-foreground")}
        >
          {label}
        </label>
        <div
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-md border border-transparent bg-card px-4 transition-colors",
            "focus-within:border-disabled",
            // Hover lifts the fill, but not while typing — the focused state
            // keeps bg/card in the design.
            "hover:not-focus-within:border-disabled hover:not-focus-within:bg-raised",
            error && "border-primary focus-within:border-primary hover:not-focus-within:border-primary"
          )}
        >
          <input
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "min-w-0 flex-1 bg-transparent type-label-s outline-none placeholder:text-muted-foreground",
              error ? "text-primary" : "text-foreground"
            )}
            {...props}
          />
          {error ? (
            // The error glyph is 12px inside a 16px frame in the icon set.
            <span className="grid size-4 shrink-0 place-items-center">
              <ErrorIcon className="size-3 text-primary" />
            </span>
          ) : (
            success && <Check className="size-4 shrink-0 text-success" />
          )}
        </div>
      </div>
      {error && (
        <p id={errorId} className="type-label-s text-primary">
          {error}
        </p>
      )}
    </div>
  )
}
