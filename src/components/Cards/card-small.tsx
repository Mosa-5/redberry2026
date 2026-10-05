import { Link } from "react-router"
import { cn } from "cn"

import type { Movie } from "@/API/types"

type CardSmallProps = {
  movie: Movie
  className?: string
}

/**
 * Compact row card — "Recently viewed" on the home page (Figma 108:1799).
 * Hover only adds a lift; nothing else changes.
 */
export const CardSmall = ({ movie, className }: CardSmallProps) => {
  return (
    <Link
      to={`/movies/${movie.slug}`}
      className={cn(
        "flex h-21.75 w-82.25 items-center justify-center gap-3 rounded-lg bg-card p-2.5",
        "transition-shadow hover:shadow-[0_4px_12px_0_var(--shadow-color)]",
        className
      )}
    >
      <span className="flex h-full flex-1 items-center">
        <img
          src={movie.posterUrl ?? ""}
          alt=""
          className="size-full rounded-xs object-cover"
        />
      </span>

      <span className="flex w-52.5 flex-col items-start gap-1">
        <span className="flex flex-col items-start gap-1 whitespace-nowrap">
          <span className="type-button text-foreground">{movie.title}</span>
          <span className="type-body-s text-muted-foreground">
            {movie.genres[0]?.name} · {movie.runtimeMinutes} min
          </span>
        </span>
        <span className="rounded-full bg-tint-red px-2 py-1 type-label-s text-primary">
          {movie.ageRating.code}
        </span>
      </span>
    </Link>
  )
}
