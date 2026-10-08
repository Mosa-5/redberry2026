import { useState } from "react"

import type { Seat, SessionDetail, TicketTypeSlug } from "@/API/types"
import { SeatMap } from "@/components/Booking/seat-map"
import { SelectionPanel } from "@/components/Booking/selection-panel"
import type { SelectedSeat } from "@/components/Booking/types"
import { Skeleton } from "@/components/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fromIsoDate } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { useGetMe } from "@/reactQuery/query/auth"
import { useGetSessionDetail } from "@/reactQuery/query/booking"
import { useGetFilterOptions } from "@/reactQuery/query/sessions"

export type BookingStep = "seats" | "checkout"

const STEPS: { id: BookingStep; label: string }[] = [
  { id: "seats", label: "Seats" },
  { id: "checkout", label: "Checkout" },
]

/** "Galleria Tbilisi · Hall B · Tuesday 15 September · 16:30 · Standard · Original with Subtitles" */
const sessionLine = (session: SessionDetail) => {
  const day = fromIsoDate(session.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
  return [
    session.venue.name,
    `Hall ${session.hall.name}`,
    day,
    session.time,
    session.format.name,
    session.language.name,
  ].join(" · ")
}

/** Step indicator (Figma Progress, 388:6297): a pill track, the current step filled red. */
const StepIndicator = ({ step }: { step: BookingStep }) => {
  return (
    <ol className="flex gap-2 rounded-full bg-card">
      {STEPS.map(({ id, label }) => (
        <li
          key={id}
          aria-current={id === step ? "step" : undefined}
          className={cn(
            "flex flex-1 justify-center rounded-full px-4 py-2.5 type-label-s text-foreground uppercase",
            id === step && "bg-primary"
          )}
        >
          {label}
        </li>
      ))}
    </ol>
  )
}

/**
 * Step 1, seat selection: the map on the left, the picked seats on the
 * right. Keyed by session, so its state starts fresh for every session.
 */
const BookingFlow = ({ session }: { session: SessionDetail }) => {
  const { data: options } = useGetFilterOptions()
  const { data: user } = useGetMe()
  const [selection, setSelection] = useState<SelectedSeat[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  const { minAge, code } = session.movie.ageRating
  // The film page disables sessions for this; the Sessions page has no age
  // gate, so the modal blocks Next instead (a brief condition for Next).
  const ageNotice =
    user?.age != null && user.age < minAge
      ? `This film is rated ${code}. You cannot buy tickets for it with this account.`
      : null

  // Child is refused on 16+ titles, so it isn't offered. Cheapest first is
  // Figma's order: Child, Student, Adult.
  const ticketTypes = (options?.ticketTypes ?? [])
    .filter((type) => type.blockedFromRatingAge === null || minAge < type.blockedFromRatingAge)
    .sort((a, b) => a.priceRatio - b.priceRatio)

  const toggleSeat = (seat: Seat) => {
    setNotice(null)
    if (selection.some((picked) => picked.seatId === seat.id)) {
      setSelection(selection.filter((picked) => picked.seatId !== seat.id))
      return
    }
    // The brief: a 4th seat shows a message instead of being added.
    if (options && selection.length >= options.maxSeatsPerOrder) {
      setNotice(`You can book up to ${options.maxSeatsPerOrder} seats per order.`)
      return
    }
    // Adult is the default type.
    setSelection([...selection, { seatId: seat.id, code: seat.code, ticketType: "adult" }])
  }

  const changeTicketType = (seatId: number, ticketType: TicketTypeSlug) => {
    setSelection(selection.map((picked) => (picked.seatId === seatId ? { ...picked, ticketType } : picked)))
  }

  const removeSeat = (seatId: number) => {
    setNotice(null)
    setSelection(selection.filter((picked) => picked.seatId !== seatId))
  }

  // TODO: hold the seats and move to checkout (the next step).
  const goToCheckout = () => {}

  return (
    <div className="flex min-h-0 flex-1 gap-5">
      <div className="flex w-180 shrink-0 flex-col">
        <StepIndicator step="seats" />
        <SeatMap
          sessionId={session.id}
          selectedIds={selection.map((picked) => picked.seatId)}
          onToggle={toggleSeat}
        />
      </div>
      <div className="w-px rounded-full bg-card" />
      {options ? (
        <SelectionPanel
          selection={selection}
          ticketTypes={ticketTypes}
          maxSeats={options.maxSeatsPerOrder}
          sessionPrice={session.price}
          notice={notice}
          ageNotice={ageNotice}
          onTicketType={changeTicketType}
          onRemove={removeSeat}
          onNext={goToCheckout}
        />
      ) : (
        <div className="flex flex-1 flex-col justify-between">
          <Skeleton className="h-4.5 w-36 rounded-sm" />
          <Skeleton className="h-10.25 w-full rounded-full" />
        </div>
      )}
    </div>
  )
}

/**
 * The two-step booking modal (Figma Seat Selection, 265:3958): the session
 * header and the step for the current stage. Checkout and the confirmation
 * come in the next steps.
 */
export const BookingDialog = ({ sessionId, onClose }: { sessionId: number | null; onClose: () => void }) => {
  const { data: session } = useGetSessionDetail({}, sessionId ?? undefined)

  const onOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Dialog open={sessionId !== null} onOpenChange={onOpenChange}>
      {/* Figma's frame is 1146×599 with no border, unlike the auth modals.
          Fixed: big halls zoom inside it rather than growing it. */}
      <DialogContent className="flex h-149.75 w-286.5 flex-col gap-8 border-0">
        {/* Right padding keeps the text clear of the close button. Figma has
            no close button here, but the brief requires one on every modal. */}
        <DialogHeader className="shrink-0 pr-10">
          {session ? (
            <>
              <DialogTitle className="uppercase">{session.movie.title}</DialogTitle>
              <DialogDescription>{sessionLine(session)}</DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="sr-only">Book tickets</DialogTitle>
              <Skeleton className="h-5 w-48 rounded-sm" />
              <Skeleton className="h-4 w-120 rounded-sm" />
            </>
          )}
        </DialogHeader>

        {session && <BookingFlow key={session.id} session={session} />}
      </DialogContent>
    </Dialog>
  )
}
