import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import Autoplay from "embla-carousel-autoplay"
import Fade from "embla-carousel-fade"
import { cn } from "cn"

import { featuredMoviesDetailed } from "@/API/requests/Catalogue"
import type { MovieDetail } from "@/API/types"
import ArrowLeft from "@/assets/icons/arrow-left.svg?react"
import { HeroSlide } from "@/components/Hero/hero-slide"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

type HeroCarouselProps = {
  className?: string
}

/**
 * The home page hero (Figma Banners, 131:4477). One full-bleed slide per
 * featured title, with segmented progress bars and a pair of arrows pinned
 * to the bottom. The controls sit outside CarouselContent so they stay put
 * while the slides move.
 */
export const HeroCarousel = ({ className }: HeroCarouselProps) => {
  const [movies, setMovies] = useState<MovieDetail[]>([])

  useEffect(() => {
    let ignore = false
    featuredMoviesDetailed().then((movies) => {
      if (!ignore) setMovies(movies)
    })
    return () => {
      ignore = true
    }
  }, [])

  const [api, setApi] = useState<CarouselApi>()
  // One stable instance, so reset() always targets the plugin Embla is
  // actually running. useState's lazy initialiser rather than a ref, because
  // the value is read during render to build the plugins array.
  const [autoplay] = useState(() =>
    Autoplay({ delay: 5000, stopOnInteraction: false })
  )

  // Embla owns the current slide, so it is read as an external store rather
  // than mirrored into state through an effect.
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!api) return () => {}
      api.on("select", onChange).on("reInit", onChange)
      return () => {
        api.off("select", onChange).off("reInit", onChange)
      }
    },
    [api]
  )
  const selected = useSyncExternalStore(
    subscribe,
    useCallback(() => api?.selectedScrollSnap() ?? 0, [api])
  )

  // Moving by hand restarts the countdown — otherwise the pending autoplay
  // tick can fire a fraction of a second after a manual move.
  const navigate = useCallback(
    (move: (api: NonNullable<CarouselApi>) => void) => {
      if (!api) return
      move(api)
      autoplay.reset()
    },
    [api, autoplay]
  )

  if (movies.length === 0) return null

  return (
    <Carousel
      setApi={setApi}
      // watchDrag off: the hero advances only via the arrows and the
      // progress bars, never by dragging.
      opts={{ loop: true, watchDrag: false }}
      // Crossfade rather than slide — the outgoing banner fades out as the
      // incoming one fades in, instead of tracking sideways.
      // stopOnInteraction defaults to true, which would kill autoplay for
      // good the first time someone used an arrow; false just restarts the
      // timer instead.
      plugins={[Fade(), autoplay]}
      className={cn("h-190 w-full mb-8", className)}
    >
      <CarouselContent className="ml-0 h-190">
        {movies.map((movie, index) => (
          <CarouselItem
            key={movie.id}
            className="relative flex px-16.75 pb-42.25 h-190 items-end"
          >
            <HeroSlide movie={movie} active={index === selected} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="absolute inset-x-0 bottom-10.5 mx-auto flex w-full items-center gap-6 px-16.75">
        <div className="flex flex-1 items-center gap-2">
          {movies.map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => navigate((api) => api.scrollTo(index))}
              aria-label={`Go to ${movie.title}`}
              className={cn(
                "h-0.75 flex-1 rounded-full transition-colors",
                index === selected ? "bg-primary" : "bg-foreground"
              )}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <HeroArrow label="Previous" onClick={() => navigate((api) => api.scrollPrev())}>
            <ArrowLeft className="size-8.5" />
          </HeroArrow>
          <HeroArrow label="Next" onClick={() => navigate((api) => api.scrollNext())}>
            {/* Same glyph; the design has no separate right-facing arrow. */}
            <ArrowLeft className="size-8.5 rotate-180" />
          </HeroArrow>
        </div>
      </div>
    </Carousel>
  )
}


const HeroArrow = ({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid size-13.5 place-items-center rounded-full text-foreground transition-all duration-400",
        // Default is the scrim at 20%; hover goes solid and lifts.
        "bg-scrim/20 hover:bg-background hover:shadow-[0_2px_8px_0_var(--shadow-color)]"
      )}
    >
      {children}
    </button>
  )
}

