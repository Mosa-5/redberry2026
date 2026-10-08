import { Fragment, useRef } from "react"
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchContentRef,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch"

import type { Seat, SeatMap as SeatMapData, SeatState } from "@/API/types"
import heldStripes from "@/assets/seat-held-stripes.svg"
import { Skeleton } from "@/components/skeleton"
import { ErrorMessage } from "@/components/state-message"
import { cn } from "@/lib/utils"
import { useGetSeatMap } from "@/reactQuery/query/booking"

/** "STALLS · ROWS A-E". Labels come from the data: hall D skips I. */
const sectionTitle = (section: SeatMapData["sections"][number]) => {
  const first = section.rows[0]?.label
  const last = section.rows.at(-1)?.label
  return `${section.name} · Rows ${first}-${last}`
}

/** The held pattern: Figma's stripe vector, rotated and clipped by the square. */
const HeldStripes = ({ className }: { className: string }) => {
  return (
    <img
      src={heldStripes}
      alt=""
      className={cn("pointer-events-none absolute top-1/2 left-1/2 max-w-none -translate-1/2 -rotate-[37.44deg]", className)}
    />
  )
}

const STATE_LABELS: Record<SeatState, string> = {
  available: "available",
  sold: "sold",
  held: "held by another user",
  unavailable: "",
}

/** One seat square (Figma Seats, 119:3146): Default, Selected, Disabled (sold) and Held. */
const SeatButton = ({ seat, selected, onToggle }: { seat: Seat; selected: boolean; onToggle: (seat: Seat) => void }) => {
  // A gap in the plan: keep the cell so the grid stays aligned, but no button.
  if (seat.state === "unavailable") return <span aria-hidden className="size-13 shrink-0" />

  // The user's own live hold comes back as "held" too, with isMine set. It
  // is theirs, not blocked: treat it as available (selected once restored).
  const state = seat.isMine ? "available" : seat.state
  const blocked = state === "sold" || state === "held"

  return (
    <button
      type="button"
      disabled={blocked}
      aria-pressed={blocked ? undefined : selected}
      aria-label={`Seat ${seat.code}, ${selected ? "selected" : STATE_LABELS[state]}`}
      onClick={() => onToggle(seat)}
      className={cn(
        "relative grid size-13 shrink-0 place-items-center overflow-hidden rounded-sm bg-card type-button outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        state === "available" && !selected && "cursor-pointer border border-disabled text-foreground shadow-card",
        selected && "cursor-pointer border border-background bg-primary text-foreground",
        state === "sold" && "text-disabled",
        state === "held" && "text-muted-foreground"
      )}
    >
      {/* Figma's 83.6px stripes in a 52px seat. */}
      {state === "held" && <HeldStripes className="w-[160.9%]" />}
      <span className="relative">{seat.label}</span>
    </button>
  )
}

const LEGEND: { label: string; swatch: React.ReactNode }[] = [
  { label: "Available", swatch: <span className="size-4 rounded-[0.3125rem] border border-disabled bg-card" /> },
  { label: "Selected", swatch: <span className="size-4 rounded-[0.3125rem] bg-primary" /> },
  { label: "Sold", swatch: <span className="size-4 rounded-[0.3125rem] bg-card" /> },
  {
    label: "Held by another user",
    swatch: (
      <span className="relative size-4 overflow-hidden rounded-[0.3125rem] bg-card">
        <HeldStripes className="w-[165.6%]" />
      </span>
    ),
  },
]

/** The map's footprint while it loads: a section heading and a block of seats. */
const SeatMapSkeleton = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <Skeleton className="h-4 w-36 self-start rounded-sm" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 4 }, (_, row) => (
          <div key={row} className="flex gap-2">
            {Array.from({ length: 10 }, (_, seat) => (
              <Skeleton key={seat} className="size-13 rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Zoom buttons for trackpads and discoverability; wheel, pinch and drag work
 * without them. Not in Figma. They sit in the legend row, outside the
 * viewport, so they never cover seats.
 */
const ZoomControls = ({ zoom }: { zoom: React.RefObject<ReactZoomPanPinchContentRef | null> }) => {
  const buttonClass =
    "grid size-8 cursor-pointer place-items-center rounded-sm border border-raised bg-card type-label-m text-foreground"

  return (
    <div className="absolute top-1/2 right-0 flex -translate-y-1/2 gap-1">
      <button type="button" aria-label="Zoom out" onClick={() => zoom.current?.zoomOut()} className={buttonClass}>
        −
      </button>
      <button type="button" aria-label="Zoom in" onClick={() => zoom.current?.zoomIn()} className={buttonClass}>
        +
      </button>
      <button
        type="button"
        aria-label="Show the whole hall"
        onClick={() => zoom.current?.resetTransform()}
        className={cn(buttonClass, "w-auto px-2.5 type-label-s")}
      >
        Fit
      </button>
    </div>
  )
}

/** Sections, rows and seats at Figma's sizes; the zoom wrapper scales them. */
const Hall = ({ map, selectedIds, onToggle }: { map: SeatMapData } & Omit<SeatMapProps, "sessionId">) => {
  return (
    <div className="flex flex-col gap-8 p-4">
      {map.sections.map((section) => (
        <section key={section.name} className="flex flex-col gap-6">
          <h3 className="type-label-s text-muted-foreground uppercase">{sectionTitle(section)}</h3>
          <div className="flex flex-col items-center gap-2.5">
            {section.rows.map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="grid h-8 w-5 shrink-0 place-items-center type-label-s text-foreground">{row.label}</span>
                {row.seats.map((seat) => (
                  <Fragment key={seat.id}>
                    <SeatButton seat={seat} selected={selectedIds.includes(seat.id)} onToggle={onToggle} />
                    {seat.aisleAfter && <span aria-hidden className="w-4 shrink-0" />}
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

type SeatMapProps = {
  sessionId: number
  selectedIds: number[]
  onToggle: (seat: Seat) => void
}

/**
 * The hall, drawn from GET /sessions/{id}/seats (Figma Seat selection,
 * 265:3956): screen, the hall, legend. Real halls run to 14 seats and 10
 * rows, more than the fixed modal holds at 52px, so the hall sits in a zoom
 * and drag viewport (the team's call): it opens fitted, and zooms in up to
 * Figma's size.
 */
export const SeatMap = ({ sessionId, selectedIds, onToggle }: SeatMapProps) => {
  const { data: map, isLoading, isError, refetch } = useGetSeatMap({}, sessionId)

  // The zoom buttons live outside the wrapper, so they reach it through a ref.
  const zoom = useRef<ReactZoomPanPinchContentRef>(null)

  // A drag that ends over a seat would also fire its click. Remember how
  // far the hall moved, and drop that click if it was a real drag.
  const panStart = useRef({ x: 0, y: 0 })
  const dragged = useRef(false)

  const onPanningStart = ({ state }: ReactZoomPanPinchRef) => {
    panStart.current = { x: state.positionX, y: state.positionY }
  }

  const onPanningStop = ({ state }: ReactZoomPanPinchRef) => {
    const distance = Math.hypot(state.positionX - panStart.current.x, state.positionY - panStart.current.y)
    dragged.current = distance > 4
  }

  const toggleSeat = (seat: Seat) => {
    if (dragged.current) return
    onToggle(seat)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8 pt-9">
      <div className="px-5">
        <div className="grid h-7.5 place-items-center rounded-b-xl bg-raised type-label-s text-foreground uppercase">
          Screen
        </div>
      </div>

      {/* A new press always starts as a click until it moves. */}
      <div className="relative min-h-0 flex-1" onPointerDownCapture={() => (dragged.current = false)}>
        {isLoading ? (
          <SeatMapSkeleton />
        ) : isError || !map ? (
          <div className="grid h-full place-items-center">
            <ErrorMessage title="Couldn't load the seat map" onRetry={() => refetch()} />
          </div>
        ) : (
          <TransformWrapper
            ref={zoom}
            fitOnInit
            // Below 1 only to fit a big hall; never past Figma's 52px seats.
            minScale={0.25}
            maxScale={1}
            centerZoomedOut
            // The library adds step × deltaY per wheel event, and a mouse notch
            // is deltaY 100: the default 0.015 jumped 1.5 — the whole range at
            // once. 0.003 is 0.3 per notch: a couple of notches from fit to full.
            wheel={{ step: 0.003 }}
            // A double click on a seat would toggle it twice and zoom.
            doubleClick={{ disabled: true }}
            onPanningStart={onPanningStart}
            onPanningStop={onPanningStop}
          >
            <TransformComponent
              wrapperClass="cursor-grab active:cursor-grabbing"
              wrapperStyle={{ width: "100%", height: "100%" }}
            >
              <Hall map={map} selectedIds={selectedIds} onToggle={toggleSeat} />
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>

      <div className="relative">
        <ul className="flex justify-center gap-6">
          {LEGEND.map(({ label, swatch }) => (
            <li key={label} className="flex items-center gap-2 type-body-s text-muted-foreground">
              {swatch}
              {label}
            </li>
          ))}
        </ul>
        {map && <ZoomControls zoom={zoom} />}
      </div>
    </div>
  )
}
