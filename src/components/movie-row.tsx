import { Children, useEffect, useState } from "react"
import { cn } from "cn"

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

type MovieRowProps = {
  /** Gap between cards, in px. Now Playing uses 17, Coming Soon 20. */
  gap?: number
  children: React.ReactNode
  className?: string
}

/**
 * A row of cards that scrolls horizontally — shared by Now Playing and
 * Coming Soon on the home page (Figma 139:2899), which differ only in the
 * card they hold and the gap between them. Cards come in as children.
 *
 * There are no arrow controls in the design: the row overflows and the
 * right edge is feathered. Embla supplies drag, which plain overflow-x
 * would not give a mouse user.
 */
export const MovieRow = ({ gap = 20, children, className }: MovieRowProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [dragging, setDragging] = useState(false)

  // Dragging across cards would otherwise select their text. Embla has no
  // option for this, but it reports the pointer, so selection is only
  // disabled for the length of the drag rather than permanently.
  useEffect(() => {
    if (!api) return
    const down = () => setDragging(true)
    const up = () => setDragging(false)
    api.on("pointerDown", down).on("pointerUp", up)
    return () => {
      api.off("pointerDown", down).off("pointerUp", up)
    }
  }, [api])

  return (
    <Carousel setApi={setApi} opts={{ align: "start" }} className={className}>
      {/* ml-0 drops shadcn's negative-margin gutter; the gap is explicit
          because the two rows use different values. */}
      {/* Drag is the only way to scroll a row, so the cursor says so.
          Buttons and links inside keep their pointer. */}
      <CarouselContent
        className={cn("ml-0 cursor-grab", dragging && "cursor-grabbing select-none")}
        style={{ gap }}
      >
        {Children.map(children, (child) => (
          <CarouselItem className="basis-auto pl-0">{child}</CarouselItem>
        ))}
      </CarouselContent>

      {/* Figma feathers the right edge with a bg/page rectangle under a
          37px blur. A gradient is the cheaper equivalent. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-18.25 bg-linear-to-l from-background to-transparent" />
    </Carousel>
  )
}
