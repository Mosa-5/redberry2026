import type { Order } from "@/API/types"
import { Skeleton } from "@/components/skeleton"
import { Button } from "@/components/ui/button"
import { shortDay } from "@/lib/dates"
import { formatPrice, refundDeadline } from "@/lib/format"

/** A labelled value in the card's meta row: "DATE / Tue 15 Sep · 16:30". */
const Meta = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="type-overline text-muted-foreground uppercase">{label}</span>
      <span className="type-label-m text-foreground">{value}</span>
    </div>
  )
}

/** Under the Refund button: when refunds close, or why they already have. */
const refundCaption = (order: Order) =>
  order.isRefundable
    ? `Refundable until ${refundDeadline(order.session)}`
    : "Refunds close 2 hours before the session"

type TicketCardProps = {
  order: Order
  /** Upcoming cards get the Refund button; Past ones show the same details without actions (the brief). */
  onRefund?: (order: Order) => void
}

/**
 * One order as a ticket (Figma My tickets, 291:18200): poster and details on
 * the left, a dashed-off stub with the order number, total and Refund.
 */
export const TicketCard = ({ order, onRefund }: TicketCardProps) => {
  const { session } = order
  const { movie } = session

  return (
    <article className="flex gap-4.5 overflow-hidden rounded-[1.625rem] bg-card">
      <div className="flex flex-1 items-center gap-4.5 px-7.5">
        <img src={movie.posterUrl ?? ""} alt="" className="h-33.5 w-25 shrink-0 rounded-sm object-cover" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="type-h2 text-foreground">{movie.title}</h3>
            <span className="rounded-full bg-tint-red px-2 py-0.75 type-label-s text-primary">{movie.ageRating.code}</span>
            <span className="type-body-m text-muted-foreground">{movie.runtimeMinutes} min</span>
          </div>
          <div className="flex gap-10">
            <Meta label="Date" value={`${shortDay(session.date)} · ${session.time}`} />
            <Meta label="Venue" value={`${session.venue.name} · Hall ${session.hall.name}`} />
            <Meta label="Format" value={`${session.format.name} · ${session.language.name}`} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-overline text-muted-foreground uppercase">Seats</span>
            {order.tickets.map((ticket) => (
              <span key={ticket.id} className="rounded-2xs bg-tint-white px-2.5 py-1 type-label-s text-foreground">
                {ticket.seatCode} · {ticket.ticketType.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-75 shrink-0 flex-col gap-4 border-l border-dashed border-raised px-6 py-5">
        <div className="flex flex-col gap-0.5">
          <span className="type-overline text-muted-foreground uppercase">Order</span>
          <span className="type-label-m text-foreground">#{order.reference}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className="type-label-m text-muted-foreground">
              {order.status === "refunded" ? "Refunded" : "Total paid"}
            </span>
            <span className="type-h1 text-foreground">₾{formatPrice(order.totalPrice)}</span>
          </div>
          {onRefund && (
            <>
              {/* The API docs: drive the button from isRefundable, never from
                  a clock comparison here. Disabled is Figma's 20% opacity. */}
              <Button
                variant="transparent"
                className="w-full py-2.5 disabled:bg-tint-white disabled:text-foreground disabled:opacity-20"
                disabled={!order.isRefundable}
                onClick={() => onRefund(order)}
              >
                Refund
              </Button>
              <p className="text-center type-body-s text-muted-foreground">{refundCaption(order)}</p>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

/** A card's footprint while My Tickets loads. */
export const TicketCardSkeleton = () => {
  return (
    <div className="flex h-47.5 gap-4.5 overflow-hidden rounded-[1.625rem] bg-card">
      <div className="flex flex-1 items-center gap-4.5 px-7.5">
        <Skeleton className="h-33.5 w-25 shrink-0 rounded-sm" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5.5 w-56 rounded-sm" />
          <Skeleton className="h-9 w-120 rounded-sm" />
          <Skeleton className="h-5.5 w-64 rounded-sm" />
        </div>
      </div>
      <div className="w-75 shrink-0 border-l border-dashed border-raised" />
    </div>
  )
}
