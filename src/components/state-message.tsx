import { cn } from "@/lib/utils"

import ErrorIcon from "@/assets/icons/error.svg?react"
import { Button } from "@/components/ui/button"

type StateMessageProps = {
  icon: React.ReactNode
  title: string
  body: string
  /** A way forward — a link or a retry. Omit when there is nothing to offer. */
  action?: React.ReactNode
  className?: string
}

/**
 * Icon, title, explanation and an optional action — the layout of the
 * search panel's Empty / No results states (Figma 326:6262), reused for
 * every empty and error state since the design has no others.
 */
export const StateMessage = ({ icon, title, body, action, className }: StateMessageProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-1.5 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-full bg-tint-white text-foreground">
        {icon}
      </span>
      <span className="h-2" />
      <p className="type-label-m text-foreground">{title}</p>
      <p className="max-w-95 type-body-m text-muted-foreground">{body}</p>
      {action && (
        <>
          <span className="h-2.5" />
          {action}
        </>
      )}
    </div>
  )
}

/** Generic failed-request message. The brief asks for a retry, never a blank area. */
export const ErrorMessage = ({
  title,
  onRetry,
  className,
}: {
  title: string
  onRetry: () => void
  className?: string
}) => {
  return (
    <StateMessage
      // 18px: the Figma glyph is 75% of a 16px frame; at the 24px used by
      // the other state icons that is 18.
      icon={<ErrorIcon className="size-4.5" />}
      title={title}
      body="Check your connection and try again."
      action={
        <Button variant="transparent" onClick={onRetry}>
          Try again
        </Button>
      }
      className={className}
    />
  )
}
