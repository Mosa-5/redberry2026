import * as React from "react"
import { cn } from "cn"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"

import ChevronDown from "@/assets/icons/chevron-down.svg?react"

// Restyled from shadcn's calendar (react-day-picker v10). Figma has no
// calendar, so it uses our tokens and the select list's surface: day cells
// highlight in tint/white like list rows, the chosen day takes the primary
// red. Day buttons are plain buttons — shadcn's used Button variants
// (ghost/icon) that our Figma Button doesn't have.

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("[--cell-size:--spacing(9)]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col", defaults.months),
        month: cn("flex w-full flex-col gap-3", defaults.month),
        nav: cn("absolute inset-x-0 top-0 flex items-center justify-between", defaults.nav),
        button_previous: cn(
          "grid size-(--cell-size) cursor-pointer place-items-center rounded-sm text-foreground hover:bg-tint-white aria-disabled:pointer-events-none aria-disabled:opacity-30",
          defaults.button_previous
        ),
        button_next: cn(
          "grid size-(--cell-size) cursor-pointer place-items-center rounded-sm text-foreground hover:bg-tint-white aria-disabled:pointer-events-none aria-disabled:opacity-30",
          defaults.button_next
        ),
        month_caption: cn("flex h-(--cell-size) items-center justify-center px-(--cell-size)", defaults.month_caption),
        dropdowns: cn("flex items-center gap-2", defaults.dropdowns),
        // The month and year pickers are native selects laid invisibly over
        // a styled label, so they open the OS list (fast for picking a year
        // decades back) while looking like the rest of the field.
        dropdown_root: cn(
          "relative flex h-8 items-center rounded-sm border border-raised px-2 hover:bg-tint-white has-focus-visible:border-disabled",
          defaults.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 cursor-pointer opacity-0 [&>option]:bg-card [&>option]:text-foreground",
          defaults.dropdown
        ),
        caption_label: cn("flex items-center gap-1 type-label-m text-foreground", defaults.caption_label),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn("w-(--cell-size) type-body-s text-muted-foreground", defaults.weekday),
        week: cn("mt-1 flex", defaults.week),
        day: cn("size-(--cell-size) p-0 text-center", defaults.day),
        today: cn("text-primary", defaults.today),
        outside: cn("text-muted-foreground", defaults.outside),
        disabled: cn("opacity-30", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation }) => (
          <ChevronDown
            className={cn(
              "size-4",
              orientation === "left" && "rotate-90",
              orientation === "right" && "-rotate-90",
              orientation === "up" && "rotate-180",
              className
            )}
          />
        ),
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  // Keyboard navigation moves react-day-picker's focus; follow it.
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      data-day={day.isoDate}
      className={cn(
        "grid size-(--cell-size) cursor-pointer place-items-center rounded-sm type-label-s outline-none",
        "hover:bg-tint-white focus-visible:ring-2 focus-visible:ring-disabled disabled:pointer-events-none",
        modifiers.selected && "bg-primary text-foreground hover:bg-primary",
        className
      )}
      {...props}
    />
  )
}

export { Calendar }
