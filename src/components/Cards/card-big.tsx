import { cn } from "cn"

import type { Movie } from "@/API/types"
import { Button } from "@/components/ui/button"

type CardBigProps = {
  movie: Movie
  /**
   * Revealed on hover. /movies/now-playing returns Movie, which has no
   * synopsis — pass it from a detail call if the expanded state is wanted.
   */
  synopsis?: string
  className?: string
}

/**
 * Poster card — "Now Playing" on the home page (Figma 108:2446).
 *
 * Hover widens the card from 260 to 447 and reveals the synopsis. The poster
 * shrinks to absorb the change so the card's height stays fixed.
 */
export const CardBig = ({ movie, synopsis, className }: CardBigProps) => {
  return (
    <a
      href={`/movies/${movie.slug}`}
      className={cn(
        "group/card flex h-113 w-65 flex-col items-center justify-center rounded-xl border border-transparent bg-card p-3.5 shadow-card",
        "transition-all duration-300 hover:w-111.75 hover:border-raised",
        className
      )}
    >
      <div className="flex w-full flex-col gap-3">
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex min-h-0 flex-1 items-center">
            <img
              src={movie.posterUrl ?? ""}
              alt=""
              className="size-full rounded-[14px] object-cover"
            />
          </div>

          <div className="flex w-full flex-col items-start gap-2">
            <p className="type-h2 w-full text-foreground">{movie.title}</p>
            <p className="type-body-m whitespace-nowrap text-muted-foreground">
              {movie.genres[0]?.name} · {movie.runtimeMinutes} min
            </p>
            <span className="rounded-full bg-tint-red px-2 py-1 type-label-s text-primary">
              {movie.ageRating.code}
            </span>
          </div>

          {synopsis && (
            <p className="type-body-m hidden pr-5 text-muted-foreground group-hover/card:block">
              {synopsis}
            </p>
          )}
        </div>

        <div className="flex w-full items-center justify-between">
          <p className="type-button whitespace-nowrap text-foreground">
            From ₾ {movie.fromPrice}
          </p>
          <Button className="py-2.5">Buy Ticket</Button>
        </div>
      </div>
    </a>
  )
}
