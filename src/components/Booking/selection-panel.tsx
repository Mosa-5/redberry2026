import type { TicketType, TicketTypeSlug } from "@/API/types"
import CloseModal from "@/assets/icons/close-modal.svg?react"
import type { SelectedSeat } from "@/components/Booking/types"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Same pill as the film page's age note, for the panel's warnings. Not in Figma. */
const Notice = ({ children }: { children: React.ReactNode }) => {
  return <p className="rounded-md bg-tint-warning px-3.25 py-2.25 type-body-s text-warning">{children}</p>
}

type SeatCardProps = {
  seat: SelectedSeat
  ticketTypes: TicketType[]
  price: number
  onTicketType: (type: TicketTypeSlug) => void
  onRemove: () => void
}

/** One picked seat (Figma Seat, 259:2207): code, price, remove, and the ticket type chips. */
const SeatCard = ({ seat, ticketTypes, price, onTicketType, onRemove }: SeatCardProps) => {
  return (
    <li className="flex flex-col gap-3 rounded-lg bg-card p-3.75">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-3">
          <span className="type-body-s text-muted-foreground">Seat</span>
          <span className="type-label-s text-foreground">{seat.code}</span>
        </p>
        <div className="flex items-center gap-3">
          <span className="type-label-s text-foreground">₾{formatPrice(price)}</span>
          {/* Figma's 16px close is the modal's 24px glyph scaled down. */}
          <button
            type="button"
            aria-label={`Remove seat ${seat.code}`}
            onClick={onRemove}
            className="cursor-pointer text-muted-foreground"
          >
            <CloseModal className="size-4" />
          </button>
        </div>
      </div>
      <div className="h-px bg-raised" />
      <div role="radiogroup" aria-label={`Ticket type for ${seat.code}`} className="flex gap-2">
        {ticketTypes.map((type) => (
          <button
            key={type.slug}
            type="button"
            role="radio"
            aria-checked={seat.ticketType === type.slug}
            onClick={() => onTicketType(type.slug)}
            className={cn(
              "flex-1 cursor-pointer rounded-lg bg-raised py-2 type-body-s text-foreground",
              seat.ticketType === type.slug && "bg-primary"
            )}
          >
            {type.name} {Math.round(type.priceRatio * 100)}%
          </button>
        ))}
      </div>
    </li>
  )
}

type SelectionPanelProps = {
  selection: SelectedSeat[]
  /** Already filtered for the film's rating and in Figma's order. */
  ticketTypes: TicketType[]
  maxSeats: number
  /** The adult price; the other types scale off it. */
  sessionPrice: number
  /** Shown above the list, e.g. after trying to pick one seat too many. */
  notice: string | null
  /** Set when the viewer is too young for the film; blocks Next. */
  ageNotice: string | null
  onTicketType: (seatId: number, type: TicketTypeSlug) => void
  onRemove: (seatId: number) => void
  onNext: () => void
}

/** Right column of step 1 (Figma 243:1797): the picked seats, subtotal and Next. */
export const SelectionPanel = ({
  selection,
  ticketTypes,
  maxSeats,
  sessionPrice,
  notice,
  ageNotice,
  onTicketType,
  onRemove,
  onNext,
}: SelectionPanelProps) => {
  const priceOf = (seat: SelectedSeat) => {
    const ratio = ticketTypes.find((type) => type.slug === seat.ticketType)?.priceRatio ?? 1
    return Math.round(sessionPrice * ratio * 100) / 100
  }
  // A preview: the hold response carries the price the API will charge.
  const subtotal = selection.reduce((sum, seat) => sum + priceOf(seat), 0)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-3">
      <div className="flex min-h-0 flex-col gap-3">
        <h3 className="type-button text-foreground">Your seats · Max {maxSeats}</h3>
        {notice && <Notice>{notice}</Notice>}
        {selection.length === 0 ? (
          <p className="type-body-s text-muted-foreground">
            Pick up to {maxSeats} seats from the map. Each seat can carry its own ticket type.
          </p>
        ) : (
          // An 8px gutter (4px bar), always reserved so the third card doesn't
          // squeeze the others; pulled into the modal padding so the cards keep
          // Figma's full width.
          <ul className="scrollbar-brand -mr-2 flex min-h-0 flex-col gap-3 overflow-y-auto [--scrollbar-inset:0.125rem] [--scrollbar-size:0.5rem] [scrollbar-gutter:stable]">
            {selection.map((seat) => (
              <SeatCard
                key={seat.seatId}
                seat={seat}
                ticketTypes={ticketTypes}
                price={priceOf(seat)}
                onTicketType={(type) => onTicketType(seat.seatId, type)}
                onRemove={() => onRemove(seat.seatId)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-2.5">
        {ageNotice && <Notice>{ageNotice}</Notice>}
        <div className="flex items-center justify-between px-1.25">
          <span className="type-label-s text-foreground uppercase">Subtotal</span>
          <span className="type-h1 text-foreground">₾ {formatPrice(subtotal)}</span>
        </div>
        <Button className="w-full" disabled={selection.length === 0 || ageNotice !== null} onClick={onNext}>
          Next: Checkout
        </Button>
      </div>
    </div>
  )
}
