import { Children } from "react"

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

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
  return (
    <Carousel opts={{ align: "start" }} className={className}>
      {/* ml-0 drops shadcn's negative-margin gutter; the gap is explicit
          because the two rows use different values. */}
      <CarouselContent className="ml-0" style={{ gap }}>
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
