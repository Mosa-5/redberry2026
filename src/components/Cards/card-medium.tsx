import { cn } from "cn"

import type { Movie } from "@/API/types"
import Bell from "@/assets/icons/bell.svg?react"
import Check from "@/assets/icons/check.svg?react"
import { Button } from "@/components/ui/button"
import { releaseLabel } from "@/lib/format"

type CardMediumProps = {
  movie: Movie
  /** Whether the viewer already has a reminder set for this title. */
  notified?: boolean
  onNotify?: () => void
  className?: string
}

/**
 * Landscape card for unreleased titles — "Coming Soon" on the home page
 * (Figma 108:2346). These have no sessions, so the action is Notify Me
 * rather than a ticket link.
 */
export const CardMedium = ({
  movie,
  notified,
  onNotify,
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

        <Button
          variant="notify"
          size="sm"
          aria-pressed={notified}
          onClick={onNotify}
        >
          {notified ? (
            <Check className="size-4" />
          ) : (
            <Bell className="size-4" />
          )}
          {notified ? "Reminder set" : "Notify Me"}
        </Button>
      </div>
    </div>
  )
}
