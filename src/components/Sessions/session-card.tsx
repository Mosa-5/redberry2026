import { cn } from "cn"

import type { Session } from "@/API/types"
import SeatsLeft from "@/assets/icons/seats-left.svg?react"

/**
 * Below this many seats left the count (and its ticket icon) turns red, as
 * in Figma's red card (429:7127). The design shows 1, 3, 5 and 6 red and 12+
 * green but states no cut-off, so it sits between them.
 */
const LOW_SEATS = 10

/**
 * Showtime card on the Sessions page (Figma Sessions time, 276:10275). Its
 * Hover variant is identical to Default; Disabled (sold out) is at 40%.
 */
export const SessionCard = ({ session, onSelect }: { session: Session; onSelect: (session: Session) => void }) => {
  return (
    <button
      type="button"
      disabled={session.isSoldOut}
      onClick={() => onSelect(session)}
      className="flex w-63 shrink-0 cursor-pointer flex-col gap-3 rounded-lg bg-card p-3.75 text-left disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="type-h3 text-foreground">{session.time}</span>
        <span className="rounded-full bg-raised px-2.5 py-1.25 type-label-s text-foreground">{session.format.name}</span>
      </span>

      <span className="flex w-full items-start gap-2">
        <span className="flex min-w-0 flex-1 flex-col gap-2.5">
          <span className="type-body-s whitespace-nowrap text-muted-foreground">{session.language.name}</span>
          <span className="type-label-s text-foreground">
            {session.venue.name} · Hall {session.hall.name}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end justify-center gap-2.5">
          <span
            className={cn(
              "flex h-3.25 items-center gap-1 type-body-s whitespace-nowrap",
              session.isSoldOut
                ? "text-muted-foreground"
                : session.seatsLeft < LOW_SEATS
                  ? "text-primary"
                  : "text-success"
            )}
          >
            {session.isSoldOut ? (
              "Sold out"
            ) : (
              <>
                {/* One glyph for both states: its fill follows the text colour. */}
                <SeatsLeft className="size-3 [&_path]:fill-current" />
                {session.seatsLeft} left
              </>
            )}
          </span>
          <span className="type-button text-foreground">₾{session.price}</span>
        </span>
      </span>
    </button>
  )
}
