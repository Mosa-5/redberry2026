import type { SeatHold, SessionDetail } from "@/API/types"
import { CHECKOUT_FORM_ID } from "@/components/Booking/checkout-form"
import { Button } from "@/components/ui/button"
import { formatPrice, sessionShortLine, ticketsLine } from "@/lib/format"
import { cn } from "@/lib/utils"

type SummaryCardProps = {
  title: string
  line: string
  seats: string[]
  tickets: string[]
  /** The confirmation's version adds the poster and the total paid. */
  posterUrl?: string | null
  total?: number
  className?: string
}

/**
 * Film, session and what was booked (Figma Summary, 259:3082 at checkout,
 * 259:3304 on the confirmation).
 */
export const SummaryCard = ({ title, line, seats, tickets, posterUrl, total, className }: SummaryCardProps) => {
  return (
    <div className={cn("flex flex-col rounded-md bg-card", className)}>
      <div className="flex items-start gap-2.5">
        {posterUrl && <img src={posterUrl} alt="" className="h-16 w-12 shrink-0 rounded-xs object-cover" />}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="type-button text-foreground uppercase">{title}</p>
          <p className="type-body-s text-muted-foreground">{line}</p>
        </div>
      </div>
      <div className="h-px bg-raised" />
      <div className="flex items-center justify-between gap-4">
        <span className="type-body-s text-muted-foreground">Seats</span>
        <span className="type-label-s text-foreground">{seats.join(", ")}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="type-body-s text-muted-foreground">Tickets</span>
        <span className="type-body-s text-foreground">{ticketsLine(tickets)}</span>
      </div>
      {total !== undefined && (
        <>
          <div className="h-px bg-raised" />
          <div className="flex items-center justify-between gap-4">
            <span className="type-body-s text-muted-foreground uppercase">Total paid</span>
            <span className="type-h3 text-foreground">₾ {formatPrice(total)}</span>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Checkout's right column (Figma 259:3400): the summary from the hold — the
 * prices the API will charge — the subtotal and Pay.
 */
export const CheckoutSummary = ({
  session,
  hold,
  paying,
}: {
  session: SessionDetail
  hold: SeatHold
  paying: boolean
}) => {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
      <div className="flex flex-col gap-3">
        <h3 className="type-button text-foreground">Summary</h3>
        <SummaryCard
          title={session.movie.title}
          line={sessionShortLine(session)}
          seats={hold.seats.map((seat) => seat.code)}
          tickets={hold.seats.map((seat) => seat.ticketType.name)}
          className="gap-2.5 p-4"
        />
      </div>

      <div className="flex flex-col gap-3 pt-2.5">
        <div className="flex items-center justify-between px-1.25">
          <span className="type-label-s text-foreground uppercase">Subtotal</span>
          <span className="type-h1 text-foreground">₾ {formatPrice(hold.subtotal)}</span>
        </div>
        {/* The brief: a loading state, and no second order from a double click. */}
        <Button type="submit" form={CHECKOUT_FORM_ID} className="w-full" disabled={paying}>
          {paying ? "Paying…" : "Pay: Complete order"}
        </Button>
      </div>
    </div>
  )
}
