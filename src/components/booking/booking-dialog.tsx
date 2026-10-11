import { useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useState } from "react"

import type { Order, Seat, SeatHold, SeatMap as SeatMapData, SessionDetail, TicketTypeSlug } from "@/api/types"
import { CheckoutForm } from "@/components/booking/checkout-form"
import { Confirmation } from "@/components/booking/confirmation"
import { HoldTimer } from "@/components/booking/hold-timer"
import { CheckoutSummary } from "@/components/booking/order-summary"
import { SeatMap } from "@/components/booking/seat-map"
import { SelectionPanel } from "@/components/booking/selection-panel"
import type { SelectedSeat } from "@/components/booking/types"
import { Skeleton } from "@/components/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fromIsoDate } from "@/lib/dates"
import { clearSavedHold, readSavedHold, saveHold } from "@/lib/saved-hold"
import { cn } from "@/lib/utils"
import { useCreateOrder, useHoldSeats, type SeatConflict } from "@/reactQuery/mutations/booking"
import { useGetMe } from "@/reactQuery/queries/auth"
import { useGetHold, useGetSessionDetail } from "@/reactQuery/queries/booking"
import { useGetFilterOptions } from "@/reactQuery/queries/sessions"

export type BookingStep = "seats" | "checkout"

const STEPS: { id: BookingStep; label: string }[] = [
  { id: "seats", label: "Seats" },
  { id: "checkout", label: "Checkout" },
]

/** The brief's wording, shown when the hold runs out. */
const EXPIRED_NOTICE = "Your hold time expired. Please re-select your seats."

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

/** The hold's seats in the selection's shape, to restore the panel from it. */
const toSelection = (hold: SeatHold): SelectedSeat[] =>
  hold.seats.map((seat) => ({ seatId: seat.seatId, code: seat.code, ticketType: seat.ticketType.slug }))

/** True when the hold already covers exactly these seats and types, so Next needn't hold again. */
const matchesHold = (hold: SeatHold, selection: SelectedSeat[]) =>
  hold.seats.length === selection.length &&
  selection.every((picked) =>
    hold.seats.some((seat) => seat.seatId === picked.seatId && seat.ticketType.slug === picked.ticketType)
  )

/** "G13 was" / "G13 and G14 were" */
const lostSeatsText = (codes: string[]) =>
  codes.length === 1 ? `${codes[0]} was` : `${codes.slice(0, -1).join(", ")} and ${codes.at(-1)} were`

/** Title, session line and, once seats are held, the countdown. */
const SessionHeader = ({ session, timer }: { session: SessionDetail; timer?: React.ReactNode }) => {
  return (
    // Right padding keeps the timer clear of the close button. Figma has no
    // close button here, but the brief requires one on every modal.
    <div className="flex shrink-0 items-start gap-4 pr-10">
      <DialogHeader className="min-w-0 flex-1">
        <DialogTitle className="uppercase">{session.movie.title}</DialogTitle>
        <DialogDescription>{sessionLine(session)}</DialogDescription>
      </DialogHeader>
      {timer}
    </div>
  )
}

type StepIndicatorProps = {
  step: BookingStep
  /** Moves to the other step; undefined when that isn't possible right now. */
  onSwitch?: () => void
}

/**
 * Step indicator (Figma Progress, 388:6297): a pill track, the current step
 * filled red. The other step is a button, as in Figma: Checkout does what
 * Next does, Seats goes back keeping the hold.
 */
const StepIndicator = ({ step, onSwitch }: StepIndicatorProps) => {
  return (
    <ol className="flex shrink-0 gap-2 rounded-full bg-card">
      {STEPS.map(({ id, label }) => {
        const current = id === step
        const className = cn(
          "flex w-full justify-center rounded-full px-4 py-2.5 type-label-s text-foreground uppercase",
          current && "bg-primary"
        )
        return (
          <li key={id} aria-current={current ? "step" : undefined} className="flex flex-1">
            {current ? (
              <span className={className}>{label}</span>
            ) : (
              <button
                type="button"
                disabled={!onSwitch}
                onClick={onSwitch}
                className={cn(className, "cursor-pointer disabled:cursor-default")}
              >
                {label}
              </button>
            )}
          </li>
        )
      })}
    </ol>
  )
}

const PanelSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col justify-between">
      <Skeleton className="h-4.5 w-36 rounded-sm" />
      <Skeleton className="h-10.25 w-full rounded-full" />
    </div>
  )
}

type BookingFlowProps = {
  session: SessionDetail
  restoredHold: SeatHold | null
}

/**
 * Both steps of the booking — seat selection (map + panel) and checkout —
 * then the confirmation. Owns the selection, the hold and the order.
 * Mounted fresh for every session, with a restored hold when the user
 * already had one running.
 */
const BookingFlow = ({ session, restoredHold }: BookingFlowProps) => {
  const queryClient = useQueryClient()
  const { data: options } = useGetFilterOptions()
  const { data: user } = useGetMe()
  const { mutateAsync: holdSeats, isPending: holding } = useHoldSeats()
  const { mutateAsync: createOrder, isPending: paying } = useCreateOrder()

  const [step, setStep] = useState<BookingStep>(restoredHold ? "checkout" : "seats")
  const [selection, setSelection] = useState<SelectedSeat[]>(() => (restoredHold ? toSelection(restoredHold) : []))
  const [hold, setHold] = useState<SeatHold | null>(restoredHold)
  const [notice, setNotice] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

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

  const canContinue = selection.length > 0 && ageNotice === null && !holding

  const refetchMap = () => queryClient.invalidateQueries({ queryKey: ["seatMap", session.id] })

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

  /**
   * The API docs' five steps for a 409: name the lost seats, mark them sold,
   * drop them from the selection, keep the rest, refetch the map.
   */
  const recoverFromConflict = (contested: string[]) => {
    setNotice(`${lostSeatsText(contested)} just taken by someone else. Your other seats are still selected.`)
    queryClient.setQueryData<SeatMapData>(["seatMap", session.id], (map) =>
      map && {
        ...map,
        sections: map.sections.map((section) => ({
          ...section,
          rows: section.rows.map((row) => ({
            ...row,
            seats: row.seats.map((seat) => (contested.includes(seat.code) ? { ...seat, state: "sold" } : seat)),
          })),
        })),
      }
    )
    setSelection((current) => current.filter((picked) => !contested.includes(picked.code)))
    refetchMap()
  }

  const goToCheckout = async () => {
    // Back from checkout with nothing changed: the hold already covers it.
    if (hold && matchesHold(hold, selection)) {
      setStep("checkout")
      return
    }
    setNotice(null)
    try {
      // Holding again replaces any earlier hold; no need to release it first.
      const newHold = await holdSeats({
        sessionId: session.id,
        seats: selection.map(({ seatId, ticketType }) => ({ seatId, ticketType })),
      })
      saveHold({ holdId: newHold.holdId, sessionId: session.id })
      setHold(newHold)
      setStep("checkout")
    } catch (error) {
      if (!isAxiosError<SeatConflict>(error) || !error.response) {
        setNotice("Couldn't hold your seats. Check your connection and try again.")
        return
      }
      const { status, data } = error.response
      if (status === 409) {
        recoverFromConflict(data.contested ?? [])
      } else if (status === 422) {
        // Rule failures (profile, age, session started) and field errors
        // both carry a message written for the user; show it as given.
        setNotice(data.message)
      } else if (status !== 401) {
        // A 401 only gets here if the user closed the login modal instead
        // of signing back in (a login replays the hold); nothing to show.
        setNotice("Couldn't hold your seats. Please try again.")
      }
    }
  }

  // The brief: at zero the seats are released, the selection cleared, the
  // modal returns to step 1, the map is refetched and the reason is shown.
  const expireHold = () => {
    clearSavedHold()
    setHold(null)
    setSelection([])
    setStep("seats")
    setNotice(EXPIRED_NOTICE)
    refetchMap()
  }

  // Paid: the hold is spent, so forget it — otherwise closing would try to
  // release it.
  const completeOrder = (paid: Order) => {
    clearSavedHold()
    setHold(null)
    setOrder(paid)
  }

  // The API docs: an order 409 gets the same recovery as a hold 409, back on
  // the map where the user can pick again.
  const recoverOrderConflict = (contested: string[]) => {
    setStep("seats")
    recoverFromConflict(contested)
  }

  if (order) return <Confirmation order={order} />

  const timer = hold && <HoldTimer key={hold.holdId} expiresAt={hold.expiresAt} onExpire={expireHold} />

  const switchStep = step === "seats" ? (canContinue ? goToCheckout : undefined) : () => setStep("seats")

  return (
    <>
      <SessionHeader session={session} timer={timer} />

      <div className="flex min-h-0 flex-1 gap-5">
        <div className="flex w-180 shrink-0 flex-col">
          <StepIndicator step={step} onSwitch={switchStep} />
          {step === "checkout" && hold && user ? (
            // Scrolls if error messages push the form past the fixed modal.
            <div className="scrollbar-brand min-h-0 flex-1 overflow-y-auto">
              <CheckoutForm
                user={user}
                holdId={hold.holdId}
                createOrder={createOrder}
                onPaid={completeOrder}
                onConflict={recoverOrderConflict}
                onExpired={expireHold}
              />
            </div>
          ) : (
            <SeatMap
              sessionId={session.id}
              selectedIds={selection.map((picked) => picked.seatId)}
              onToggle={toggleSeat}
            />
          )}
        </div>
        <div className="w-px rounded-full bg-card" />
        {step === "checkout" && hold ? (
          <CheckoutSummary session={session} hold={hold} paying={paying} />
        ) : options ? (
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
            holding={holding}
          />
        ) : (
          <PanelSkeleton />
        )}
      </div>
    </>
  )
}

/**
 * Checks for a hold saved on an earlier visit (a reload, or logging out and
 * back in) before the flow mounts, so the flow can start from it. Only a
 * live hold is restored; an expired, released or another account's hold
 * (403) is ignored.
 */
const BookingBody = ({ session }: { session: SessionDetail }) => {
  const [savedHoldId] = useState(() => readSavedHold(session.id))
  const { data: savedHold, isLoading } = useGetHold({}, savedHoldId ?? undefined)

  if (isLoading) {
    return (
      <>
        <SessionHeader session={session} />
        <div className="flex min-h-0 flex-1 gap-5">
          <Skeleton className="w-180 rounded-lg" />
          <div className="w-px rounded-full bg-card" />
          <PanelSkeleton />
        </div>
      </>
    )
  }

  return <BookingFlow session={session} restoredHold={savedHold?.isLive ? savedHold : null} />
}

/** The two-step booking modal and its confirmation (Figma Seat Selection, 265:3958). */
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
        {session ? (
          // Keyed by session, so every session starts from a clean state.
          <BookingBody key={session.id} session={session} />
        ) : (
          <DialogHeader className="shrink-0 pr-10">
            <DialogTitle className="sr-only">Book tickets</DialogTitle>
            <Skeleton className="h-5 w-48 rounded-sm" />
            <Skeleton className="h-4 w-120 rounded-sm" />
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  )
}
