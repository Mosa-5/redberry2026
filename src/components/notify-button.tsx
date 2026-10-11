import type { Movie } from "@/api/types"
import Bell from "@/assets/icons/bell.svg?react"
import Check from "@/assets/icons/check.svg?react"
import { useAuthDialog } from "@/components/auth/auth-dialog-context"
import { Button } from "@/components/ui/button"
import { useNotifyMovie } from "@/reactQuery/mutations/catalogue"

/**
 * Notify Me for a coming soon title (Figma Button Notify / Notify_Hover /
 * Notify_Success). Needs a login: a guest gets the login modal and the
 * reminder is set straight after (the brief's no-second-click rule). The
 * API has no unsubscribe, so "Reminder set" is final.
 */
export const NotifyButton = ({ movie }: { movie: Movie }) => {
  const { requireAuth } = useAuthDialog()
  const { mutate: notify, isPending, error } = useNotifyMovie()
  const notified = !!movie.isNotified
  // A 401 that reaches here means the user closed the login modal; nothing
  // failed that they need telling about.
  const failed = !!error && error.response?.status !== 401

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="notify"
        size="sm"
        aria-pressed={notified}
        // Not `disabled`: that would swap in the grey disabled style, and the
        // set state should keep its Notify_Success look.
        aria-disabled={notified || isPending}
        onClick={() => {
          if (notified || isPending) return
          requireAuth(() => notify(movie.slug))
        }}
        className="aria-disabled:cursor-default"
      >
        {notified ? <Check className="size-4" /> : <Bell className="size-4" />}
        {notified ? "Reminder set" : isPending ? "Setting…" : failed ? "Try again" : "Notify Me"}
      </Button>
      {/* Not in Figma. The brief: a failed request says so and offers a
          retry; the button itself is the retry. */}
      {failed && (
        <p role="alert" className="type-label-s text-primary">
          Couldn't set it.
        </p>
      )}
    </div>
  )
}
