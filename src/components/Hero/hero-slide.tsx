import { cn } from "cn"

import type { MovieDetail } from "@/API/types"
import Ticket from "@/assets/icons/ticket.svg?react"
import Timer from "@/assets/icons/timer.svg?react"
import { Button } from "@/components/ui/button"
import { premiereLabel } from "@/lib/format"

type HeroSlideProps = {
  movie: MovieDetail
  /** Whether this is the slide currently on screen. */
  active: boolean
}

/** One banner in the home page hero (Figma Banners, 131:4477). */
export const HeroSlide = ({ movie, active }: HeroSlideProps) => {
  return (
    <>
      {movie.backdropUrl && (
        <img
          src={movie.backdropUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
      {/* Darkens the left side so the copy stays readable. */}
      <div className="absolute inset-0 bg-linear-to-l from-black/8 to-black/80" />

      {/* The images crossfade, but overlapping text reads as a double
          exposure — so the copy drops out fast and the incoming block
          waits for it to clear before fading in. */}
      <div
        className={cn(
          "flex w-full max-w-145 flex-col gap-3.75 z-2 transition-opacity",
          active ? "opacity-100 duration-500" : "opacity-0 duration-100"
        )}
      >
        <Badge className="bg-tint-red text-primary w-fit">
          {premiereLabel(movie.releaseDate)}
        </Badge>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            <h1 className="type-display text-foreground">{movie.title}</h1>

            <div className="flex items-start gap-2">
              <Badge className="bg-tint-red text-primary">
                {movie.ageRating.code}
              </Badge>
              <Badge className="bg-tint-white text-foreground">
                <Timer className="size-3.5" />
                {movie.runtimeMinutes} Min
              </Badge>
              {movie.formats.map((format) => (
                <Badge key={format.id} className="bg-tint-white text-foreground">
                  {format.name}
                </Badge>
              ))}
            </div>

            <p className="w-140 type-body-m text-foreground">{movie.synopsis}</p>
          </div>

          <div className="flex gap-3">
            <Button asChild>
              <a href={`/movies/${movie.slug}`}>
                <Ticket className="size-4" />
                Buy tickets
              </a>
            </Button>
            <Button variant="transparent" asChild>
              <a href={`/movies/${movie.slug}`}>All sessions</a>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

const Badge = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full px-3 py-1.5 type-label-s",
        className
      )}
    >
      {children}
    </span>
  )
}

