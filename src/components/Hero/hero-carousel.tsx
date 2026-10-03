import { useCallback, useState, useSyncExternalStore } from "react"
import Autoplay from "embla-carousel-autoplay"
import Fade from "embla-carousel-fade"
import { cn } from "cn"

import ArrowLeft from "@/assets/icons/arrow-left.svg?react"
import Popcorn from "@/assets/icons/popcorn.svg?react"
import { HeroSlide } from "@/components/Hero/hero-slide"
import { Skeleton } from "@/components/skeleton"
import { ErrorMessage, StateMessage } from "@/components/state-message"
import { Button } from "@/components/ui/button"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useGetFeaturedMovies } from "@/reactQuery/query/catalogue"

type HeroCarouselProps = {
  className?: string
}

/** Keeps the hero's footprint while it has no slides, so the page doesn't jump. */
const HeroFrame = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return <div className={cn("relative h-190 w-full mb-8 bg-card", className)}>{children}</div>
}

/** Bars in the slide's layout: premiere badge, title, badges, synopsis, buttons, progress. */
const HeroSkeleton = ({ className }: { className?: string }) => {
  return (
    <HeroFrame className={cn("flex items-end px-16.75 pb-42.25", className)}>
      <div className="flex w-145 flex-col gap-3.75">
        <Skeleton className="h-7.5 w-56 rounded-full" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-12 w-96" />
          <div className="flex gap-2">
            <Skeleton className="h-7.5 w-12 rounded-full" />
            <Skeleton className="h-7.5 w-24 rounded-full" />
            <Skeleton className="h-7.5 w-14 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-140" />
            <Skeleton className="h-4 w-140" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>
      </div>
      {/* Same row as the real controls: the bars are centred against the
          54px arrows, so the arrows have to be here for the bars to line up. */}
      <div className="absolute inset-x-0 bottom-10.5 mx-auto flex w-full items-center gap-6 px-16.75">
        <div className="flex flex-1 items-center gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-0.75 flex-1 rounded-full" />
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="size-13.5 rounded-full" />
          <Skeleton className="size-13.5 rounded-full" />
        </div>
      </div>
    </HeroFrame>
  )
}

/**
 * The home page hero (Figma Banners, 131:4477). One full-bleed slide per
 * featured title, with segmented progress bars and a pair of arrows pinned
 * to the bottom. The controls sit outside CarouselContent so they stay put
 * while the slides move.
 */
export const HeroCarousel = ({ className }: HeroCarouselProps) => {
  const { data: movies = [], isLoading, isError, refetch } = useGetFeaturedMovies()

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

  if (isLoading) return <HeroSkeleton className={className} />

  if (isError) {
    return (
      <HeroFrame className={cn("grid place-items-center", className)}>
        <ErrorMessage title="Couldn't load featured films" onRetry={() => refetch()} />
      </HeroFrame>
    )
  }

  if (movies.length === 0) {
    return (
      <HeroFrame className={cn("grid place-items-center", className)}>
        <StateMessage
          icon={<Popcorn className="size-6" />}
          title="No featured films right now"
          body="See everything that's showing in the meantime."
          action={
            <Button variant="transparent" asChild>
              <a href="/sessions">Browse all sessions</a>
            </Button>
          }
        />
      </HeroFrame>
    )
  }

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

