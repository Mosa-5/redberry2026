import type { SessionDetail } from "@/API/types"
import { Skeleton } from "@/components/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fromIsoDate } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { useGetSessionDetail } from "@/reactQuery/query/booking"

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
 * The two-step booking modal (Figma Seat Selection, 265:3958): the session
 * header, the step indicator and the map on the left, the selection on the
 * right. This is the frame; the map, selection, checkout and confirmation
 * fill it in the next steps.
 */
export const BookingDialog = ({ sessionId, onClose }: { sessionId: number | null; onClose: () => void }) => {
  const { data: session } = useGetSessionDetail({}, sessionId ?? undefined)

  const onOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Dialog open={sessionId !== null} onOpenChange={onOpenChange}>
      {/* Figma's frame is 1146×599 with no border, unlike the auth modals. */}
      <DialogContent className="flex min-h-149.75 w-286.5 flex-col gap-8 border-0">
        {/* Right padding keeps the text clear of the close button. Figma has
            no close button here, but the brief requires one on every modal. */}
        <DialogHeader className="pr-10">
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

        <div className="flex flex-1 gap-5">
          <div className="flex w-180 shrink-0 flex-col">
            <StepIndicator step="seats" />
          </div>
          <div className="w-px rounded-full bg-card" />
          <div className="flex min-w-0 flex-1 flex-col" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
