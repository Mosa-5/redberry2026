import type { Movie } from "@/API/types"
import Bell from "@/assets/icons/bell.svg?react"
import Check from "@/assets/icons/check.svg?react"
import { useAuthDialog } from "@/components/Auth/auth-dialog-context"
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
  const { mutate: notify, isPending } = useNotifyMovie()
  const notified = !!movie.isNotified

  return (
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
      {notified ? "Reminder set" : isPending ? "Setting…" : "Notify Me"}
    </Button>
  )
}
