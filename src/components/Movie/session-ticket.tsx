import { cn } from "cn"

import type { Session } from "@/API/types"
import Seat from "@/assets/icons/seat.svg?react"

type SessionTicketProps = {
  session: Session
  /** Age-gated: shown but not bookable. */
  disabled?: boolean
  onSelect: (session: Session) => void
}

/**
 * Showtime ticket (Figma Sessions, 119:3760): time, language and format on
 * the left, price and seats left past the perforation. The body is the page
 * colour with notches cut out, so the hall card shows through them. Figma's
 * hover and selected variants look identical to default.
 *
 * Deliberately wider than Figma, both halves measured in Archivo: the left
 * half (124px in Figma) overflows with the longest language/format pair
 * (GEO + PANORAMA, 127.6px), so it's 158px; the right (83px) wraps a
 * 3-digit seat count ("999 left" with its icon, 55.3px), so it's 86px.
 * Both keep 15px padding.
 */
export const SessionTicket = ({ session, disabled, onSelect }: SessionTicketProps) => {
  const unavailable = disabled || session.isSoldOut

  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={() => onSelect(session)}
      className={cn(
        "relative flex h-20.25 w-61 shrink-0 items-stretch drop-shadow-[0_1px_1px_var(--shadow-color)] [--perforation:--spacing(39.5)]",
        // The brief: sold out and age-gated sessions stay readable, visibly disabled.
        "disabled:cursor-not-allowed disabled:opacity-40"
      )}
    >
      {/* The body is its own layer so the shadow, on the button, follows the notched shape. */}
      <span className="ticket-notches absolute inset-0 rounded-md bg-background" />

      <span className="relative flex w-39.5 shrink-0 flex-col items-center justify-center gap-2 py-3.75">
        <span className="type-h2 text-foreground">{session.time}</span>
        <span className="flex items-center gap-1.5">
          <span className="type-body-s text-muted-foreground">{session.language.code}</span>
          {/* #e3e3e3 at 70% is the Figma badge text; no token carries it. */}
          <span className="rounded-full bg-card px-3 py-1 type-label-s text-[#e3e3e3]/70">{session.format.name}</span>
        </span>
      </span>

      <span className="relative flex w-21.5 shrink-0 flex-col items-center justify-center gap-2 px-3.75 py-2.5">
        <span className="type-h3 text-primary">₾ {session.price}</span>
        {/* nowrap: a 3-digit count must never break onto a second line. */}
        <span className="flex items-center gap-1 type-body-s whitespace-nowrap text-muted-foreground">
          {session.isSoldOut ? (
            "Sold out"
          ) : (
            <>
              <Seat className="size-3" />
              {session.seatsLeft} left
            </>
          )}
        </span>
      </span>

      {/* Perforation between the two halves. */}
      <span className="absolute top-2.75 left-(--perforation) h-14.75 border-l-[1.5px] border-dashed border-foreground" />
    </button>
  )
}
