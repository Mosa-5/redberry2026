import { cn } from "@/lib/utils"

import type { Movie } from "@/api/types"
import { NotifyButton } from "@/components/notify-button"
import { Skeleton } from "@/components/skeleton"
import { releaseLabel } from "@/lib/format"

type CardMediumProps = {
  movie: Movie
  className?: string
}

/**
 * Landscape card for unreleased titles — "Coming Soon" on the home page
 * (Figma 108:2346). These have no sessions, so the action is Notify Me
 * rather than a ticket link.
 */
export const CardMedium = ({
  movie,
  className,
}: CardMediumProps) => {
  return (
    <div
      className={cn(
        "flex h-40 w-117.5 items-center gap-4.5 rounded-xl border border-transparent bg-card p-3.5 shadow-card",
        "transition-all hover:border-raised hover:shadow-[0_4px_12px_0_var(--shadow-color)]",
        className
      )}
    >
      <div className="flex h-full flex-1 items-center max-w-57.25">
        <img
          src={movie.posterUrl ?? ""}
          alt=""
          className="size-full rounded-[0.875rem] object-cover"
        />
      </div>

      <div className="flex w-full max-w-50.5 h-full shrink-0 flex-col items-start justify-between">
        <div className="flex flex-col items-start gap-1.75">
          <p className="type-label-s text-primary">
            {releaseLabel(movie.releaseDate)}
          </p>
          <div className="flex flex-col items-start gap-2 whitespace-nowrap">
            <p className="type-label-s text-foreground">{movie.title}</p>
            <p className="type-body-s text-muted-foreground">
              {movie.genres[0]?.name} · {movie.runtimeMinutes} min
            </p>
          </div>
          <span className="rounded-full bg-tint-red px-2 py-1 type-label-s text-primary">
            {movie.ageRating.code}
          </span>
        </div>

        <NotifyButton movie={movie} />
      </div>
    </div>
  )
}

/** Loading stand-in with the card's footprint: poster on the left, text and button on the right. */
export const CardMediumSkeleton = () => {
  return (
    <div className="flex h-40 w-117.5 items-center gap-4.5 rounded-xl bg-card p-3.5 shadow-card">
      <Skeleton className="h-full max-w-57.25 flex-1 rounded-[0.875rem]" />
      <div className="flex h-full w-50.5 shrink-0 flex-col items-start justify-between">
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-5.5 w-10 rounded-full" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
    </div>
  )
}
