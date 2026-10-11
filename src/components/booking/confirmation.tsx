import { useNavigate } from "react-router"

import type { Order } from "@/api/types"
import Confirm from "@/assets/icons/confirm.svg?react"
import { useBooking } from "@/components/booking/booking-context"
import { SummaryCard } from "@/components/booking/order-summary"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { sessionShortLine } from "@/lib/format"

/**
 * After paying (Figma Confirmation, 265:3957). Drawn from the order the API
 * returned, not from local state, so it shows what was actually stored (the
 * API docs' advice).
 */
export const Confirmation = ({ order }: { order: Order }) => {
  const navigate = useNavigate()
  const { closeBooking } = useBooking()
  const { session } = order

  // Leave the modal and go; closing first so the page underneath is what
  // the user lands on.
  const goTo = (path: string) => {
    closeBooking()
    navigate(path)
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex w-168.25 flex-col items-center gap-6">
        <div className="flex w-full flex-col items-center gap-4.5">
          <div className="flex w-91.25 flex-col items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-success">
              <Confirm className="size-8 text-foreground" />
            </span>
            <div className="flex w-full flex-col items-center gap-4 text-center">
              <div className="flex flex-col gap-2.5">
                <DialogTitle className="type-h1">Booking confirmed!</DialogTitle>
                {/* Figma's copy. The API docs don't mention sending an email. */}
                <DialogDescription className="type-body-m">
                  Your tickets are ready. We've sent the confirmation to your email.
                </DialogDescription>
              </div>
              <p className="grid h-6.5 min-w-47.5 place-items-center rounded-full bg-raised px-4 type-label-s text-foreground uppercase">
                Order #{order.reference}
              </p>
            </div>
          </div>

          <SummaryCard
            title={session.movie.title}
            line={sessionShortLine(session, true)}
            seats={order.tickets.map((ticket) => ticket.seatCode)}
            tickets={order.tickets.map((ticket) => ticket.ticketType.name)}
            posterUrl={session.movie.posterUrl}
            total={order.totalPrice}
            className="w-full gap-3 p-5"
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={() => goTo("/profile?tab=tickets")}>View my tickets</Button>
          <Button variant="transparent" onClick={() => goTo("/")}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}
