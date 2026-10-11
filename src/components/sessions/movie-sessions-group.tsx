import type { MovieSessions, Session } from "@/api/types"
import { MovieRow } from "@/components/movie-row"
import { SessionCard } from "@/components/sessions/session-card"
import { Skeleton } from "@/components/skeleton"

/**
 * One film and its showtimes (Figma Sessions group, 276:11453): poster,
 * title, rating and runtime, then a draggable row of session cards that runs
 * past the column edge as in the design.
 */
export const MovieSessionsGroup = ({
  group,
  onSelect,
}: {
  group: MovieSessions
  onSelect: (session: Session) => void
}) => {
  const { movie, sessions } = group

  return (
    <article className="flex flex-col gap-3.5">
      <header className="flex items-center gap-4">
        <img src={movie.posterUrl ?? ""} alt="" className="h-20 w-14 shrink-0 rounded-xs object-cover" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h3 className="type-h3 text-foreground">{movie.title}</h3>
            <span className="rounded-full bg-tint-red px-2 py-1 type-label-s text-primary">{movie.ageRating.code}</span>
          </div>
          <p className="type-body-m text-muted-foreground">{movie.runtimeMinutes} min</p>
        </div>
      </header>

      <MovieRow gap={12} fade={false}>
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} onSelect={onSelect} />
        ))}
      </MovieRow>
    </article>
  )
}

/** A film group's footprint while the list loads. */
export const MovieSessionsGroupSkeleton = () => {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-14 rounded-xs" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5.5 w-44 rounded-sm" />
          <Skeleton className="h-4.5 w-16 rounded-sm" />
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-26 w-63 shrink-0" />
        ))}
      </div>
    </div>
  )
}
