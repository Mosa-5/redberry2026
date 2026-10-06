import { Link } from "react-router"
import { cn } from "cn"

import type { Movie } from "@/API/types"
import Ticket from "@/assets/icons/ticket.svg?react"
import Timer from "@/assets/icons/timer.svg?react"
import { Badge } from "@/components/badge"
import { Button } from "@/components/ui/button"
import { premiereLabel } from "@/lib/format"

type HeroSlideProps = {
  movie: Movie
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
              <Link to={`/movies/${movie.slug}`}>
                <Ticket className="size-4" />
                Buy tickets
              </Link>
            </Button>
            <Button variant="transparent" asChild>
              <Link to={`/movies/${movie.slug}`}>All sessions</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
