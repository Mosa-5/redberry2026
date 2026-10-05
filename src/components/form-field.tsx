import { useId, useState } from "react"
import { cn } from "cn"

import Calendar from "@/assets/icons/calendar.svg?react"
import Check from "@/assets/icons/check.svg?react"
import ErrorIcon from "@/assets/icons/error.svg?react"
import { Calendar as DayCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fromIsoDate, toIsoDate } from "@/lib/dates"

type FieldStateProps = {
  label: string
  /** Shown under the field; turns the label, text and border red. */
  error?: string
  /** Valid and touched — shows the green check. */
  success?: boolean
  /** Muted helper line under the field, when there is no error. */
  hint?: string
  /** Icon at the right edge when there's no error or success icon (calendar, chevron). */
  trailing?: React.ReactNode
}

type FieldFrameProps = FieldStateProps & {
  id: string
  className?: string
  children: React.ReactNode
}

/**
 * Label, box and messages shared by every field — the Figma Input states
 * (263:3550): default, hover, focused, filled, error and success.
 */
const FieldFrame = ({ id, label, error, success, hint, trailing, className, children }: FieldFrameProps) => {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex flex-col gap-2.5">
        <label htmlFor={id} className={cn("type-label-s", error ? "text-primary" : "text-foreground")}>
          {label}
        </label>
        <div
          className={cn(
            "relative flex h-10 items-center gap-1.5 rounded-md border border-transparent bg-card px-4 transition-colors",
            "focus-within:border-disabled has-disabled:focus-within:border-transparent",
            // Hover lifts the fill, but not while typing — the focused state
            // keeps bg/card in the design. A disabled field doesn't react.
            "hover:not-focus-within:not-has-disabled:border-disabled hover:not-focus-within:not-has-disabled:bg-raised",
            error && "border-primary focus-within:border-primary hover:not-focus-within:border-primary"
          )}
        >
          {children}
          {error ? (
            // The error glyph is 12px inside a 16px frame in the icon set.
            <span className="pointer-events-none grid size-4 shrink-0 place-items-center">
              <ErrorIcon className="size-3 text-primary" />
            </span>
          ) : success ? (
            <Check className="pointer-events-none size-4 shrink-0 text-success" />
          ) : (
            trailing && <span className="pointer-events-none flex shrink-0 text-foreground">{trailing}</span>
          )}
        </div>
      </div>
      {error ? (
        <p id={`${id}-message`} className="type-label-s text-primary">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-message`} className="type-label-s text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

const controlClass = (error?: string) =>
  cn(
    "min-w-0 flex-1 bg-transparent type-label-s outline-none placeholder:text-muted-foreground disabled:text-muted-foreground",
    error ? "text-primary" : "text-foreground"
  )

type FormFieldProps = React.ComponentProps<"input"> & FieldStateProps

/**
 * Labelled text input. Spread `register("name")` into it — React 19 passes
 * `ref` through as an ordinary prop.
 */
export const FormField = ({ label, error, success, hint, trailing, className, id, ...props }: FormFieldProps) => {
  const fallbackId = useId()
  const inputId = id ?? fallbackId

  return (
    <FieldFrame
      id={inputId}
      label={label}
      error={error}
      success={success}
      hint={hint}
      trailing={trailing}
      className={className}
    >
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${inputId}-message` : undefined}
        className={controlClass(error)}
        {...props}
      />
    </FieldFrame>
  )
}

type SelectFieldProps = Omit<FieldStateProps, "trailing" | "success"> & {
  id?: string
  className?: string
  value: string
  onValueChange: (value: string) => void
  /** Shown while value is "". */
  placeholder: string
  disabled?: boolean
  /** SelectItem elements. */
  children: React.ReactNode
}

/**
 * Labelled select in the same frame as the inputs (Radix, via shadcn's
 * ui/select). Not a native element, so wire it to react-hook-form with a
 * Controller rather than register().
 */
export const SelectField = ({
  label,
  error,
  hint,
  className,
  id,
  value,
  onValueChange,
  placeholder,
  disabled,
  children,
}: SelectFieldProps) => {
  const fallbackId = useId()
  const selectId = id ?? fallbackId

  return (
    <FieldFrame id={selectId} label={label} error={error} hint={hint} className={className}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${selectId}-message` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FieldFrame>
  )
}

type DateFieldProps = Omit<FieldStateProps, "trailing"> & {
  id?: string
  className?: string
  /** "YYYY-MM-DD", or "" when empty — the API's format, unchanged. */
  value: string
  onChange: (value: string) => void
  /** Called when the calendar closes, so validation runs "on blur". */
  onBlur?: () => void
  placeholder: string
  /** Latest pickable day; later days are disabled and can't be navigated to. */
  max?: Date
  /** Earliest month the year dropdown offers. */
  min?: Date
}

const displayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" })

/**
 * Labelled date picker (shadcn's Popover + Calendar). The whole field opens
 * it, unlike a native date input, and the header has month and year
 * dropdowns so a birth year decades back is two clicks away.
 */
export const DateField = ({
  label,
  error,
  success,
  hint,
  className,
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  max,
  min,
}: DateFieldProps) => {
  const fallbackId = useId()
  const triggerId = id ?? fallbackId
  const [open, setOpen] = useState(false)
  const selected = value ? fromIsoDate(value) : undefined

  return (
    <FieldFrame id={triggerId} label={label} error={error} success={success} hint={hint} className={className}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) onBlur?.()
        }}
      >
        <PopoverTrigger
          id={triggerId}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${triggerId}-message` : undefined}
          // Covers the frame's left padding, like the select trigger.
          className={cn(
            "-ml-4 flex h-full min-w-0 flex-1 cursor-pointer items-center justify-between gap-1.5 pl-4 text-left type-label-s outline-none",
            error ? "text-primary" : value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span className="truncate">{selected ? displayFormat.format(selected) : placeholder}</span>
          {/* The calendar glyph is 13px inside a 16px frame in the icon set. */}
          {!error && !success && (
            <span className="grid size-4 shrink-0 place-items-center text-foreground">
              <Calendar />
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent>
          <DayCalendar
            mode="single"
            captionLayout="dropdown"
            selected={selected}
            defaultMonth={selected ?? max}
            startMonth={min}
            endMonth={max}
            disabled={max ? { after: max } : undefined}
            onSelect={(date) => {
              if (!date) return
              onChange(toIsoDate(date))
              setOpen(false)
              onBlur?.()
            }}
          />
        </PopoverContent>
      </Popover>
    </FieldFrame>
  )
}
