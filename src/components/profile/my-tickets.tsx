import { useState } from "react"
import { Link } from "react-router"

import type { Order } from "@/api/types"
import Ticket from "@/assets/icons/ticket.svg?react"
import { RefundDialog } from "@/components/profile/refund-dialog"
import { TicketCard, TicketCardSkeleton } from "@/components/profile/ticket-card"
import { ErrorMessage, StateMessage } from "@/components/state-message"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useGetTickets } from "@/reactQuery/queries/tickets"

type View = "upcoming" | "past"

const VIEWS: { id: View; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
]

/** Upcoming / Past switch with counts (Figma Tickets_Tab, 291:19183). */
const ViewSwitch = ({ view, counts, onChange }: { view: View; counts: Record<View, number>; onChange: (view: View) => void }) => {
  return (
    <div className="flex w-fit rounded-md bg-card p-1.25">
      {VIEWS.map(({ id, label }) => {
        const active = id === view
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-sm px-3.5 py-1.75 type-label-m text-muted-foreground",
              active && "bg-raised text-foreground"
            )}
          >
            {label}
            <span className={cn("type-label-s", active ? "text-foreground" : "text-disabled")}>{counts[id]}</span>
          </button>
        )
      })}
    </div>
  )
}

/** The brief: every list has an empty state, with a way forward where it makes sense. */
const EmptyTickets = ({ view }: { view: View }) => {
  return view === "upcoming" ? (
    <StateMessage
      icon={<Ticket className="size-5" />}
      title="No upcoming tickets"
      body="Book a session and your tickets will show up here."
      action={
        <Button variant="transparent" asChild>
          <Link to="/sessions">Browse sessions</Link>
        </Button>
      }
      className="py-16"
    />
  ) : (
    <StateMessage
      icon={<Ticket className="size-5" />}
      title="No past tickets"
      body="Sessions you've been to and refunded orders will appear here."
      className="py-16"
    />
  )
}

/**
 * My Tickets (Figma My Profile_Tickets, 284:17650 / 291:19541). One request
 * feeds both views; isUpcoming splits them the way the API defines the tabs
 * (Past includes refunded orders whatever their date).
 */
export const MyTickets = () => {
  const { data: orders, isLoading, isError, refetch } = useGetTickets()
  const [view, setView] = useState<View>("upcoming")
  const [refunding, setRefunding] = useState<Order | null>(null)

  const upcoming = orders?.filter((order) => order.isUpcoming) ?? []
  const past = orders?.filter((order) => !order.isUpcoming) ?? []
  const shown = view === "upcoming" ? upcoming : past

  return (
    <div className="flex flex-col gap-5">
      <ViewSwitch view={view} counts={{ upcoming: upcoming.length, past: past.length }} onChange={setView} />

      {isLoading ? (
        <div className="flex flex-col gap-5">
          <TicketCardSkeleton />
          <TicketCardSkeleton />
        </div>
      ) : isError ? (
        <ErrorMessage title="Couldn't load your tickets" onRetry={() => refetch()} className="py-16" />
      ) : shown.length === 0 ? (
        <EmptyTickets view={view} />
      ) : (
        <div className="flex flex-col gap-5">
          {shown.map((order) => (
            <TicketCard key={order.id} order={order} onRefund={view === "upcoming" ? setRefunding : undefined} />
          ))}
        </div>
      )}

      <RefundDialog order={refunding} onClose={() => setRefunding(null)} />
    </div>
  )
}
