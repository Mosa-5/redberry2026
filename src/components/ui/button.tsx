import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Variants and sizes mirror the Button component in Figma (node 97:1632).
// Variant names match the Figma variant names so the two stay comparable.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:bg-disabled disabled:text-muted-foreground disabled:border-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Figma defines no distinct hover fill for primary or secondary —
        // Primary_hover and Secondary_hover are identical to their base state,
        // so these two hover values are invented, not from the design.
        primary: "bg-primary text-foreground hover:bg-primary/90",
        secondary: "bg-white text-background hover:bg-white/90",
        transparent:
          "bg-tint-white text-foreground hover:bg-muted-foreground hover:backdrop-blur-[22px]",
        // Notify is a subscribe toggle. aria-pressed carries the subscribed
        // state, which gives the Notify_Success styling and the right
        // semantics at once; the label and icon are the caller's.
        notify:
          "border border-muted-foreground text-foreground hover:bg-tint-white aria-pressed:border-transparent aria-pressed:bg-tint-white",
        ghost:
          "border-b border-raised text-foreground hover:bg-card active:bg-raised",
      },
      size: {
        // Primary / Secondary / Transparent pills.
        default: "gap-1 rounded-full px-5.5 py-3.25 type-button",
        // Notify.
        sm: "gap-1 rounded-full px-3 py-1.5 type-label-s",
        // Ghost / Pressed — bottom-bordered tabs rather than pills.
        tab: "p-2.5 type-body-s",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
