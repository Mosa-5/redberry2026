import { useEffect } from "react"

import type { Movie, Session } from "@/API/types"
import MagnifyingGlass from "@/assets/icons/magnifying-glass.svg?react"
import { useBooking } from "@/components/Booking/booking-context"
import { FilterPanel } from "@/components/Sessions/filter-panel"
import { MovieSessionsGroup, MovieSessionsGroupSkeleton } from "@/components/Sessions/movie-sessions-group"
import { Pagination } from "@/components/Sessions/pagination"
import { SortSelect } from "@/components/Sessions/sort-select"
import { Skeleton } from "@/components/skeleton"
import { ErrorMessage, StateMessage } from "@/components/state-message"
import { Button } from "@/components/ui/button"
import { useSessionFilters } from "@/hooks/use-session-filters"
import { useGetFilterOptions, useGetSessions } from "@/reactQuery/query/sessions"

/** Sessions page (Figma 272:7289, filtered 276:9167). Open to everyone. */
const Sessions = () => {
  const { filters, update, activeCount } = useSessionFilters()
  const { data: options } = useGetFilterOptions()
  const { data, isLoading, isError, refetch } = useGetSessions({}, filters)
  const { openBooking } = useBooking()

  // A new page of results starts from the top of the list.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [filters.page])

  // Login and the profile check happen inside openBooking.
  const onSelectSession = (session: Session, movie: Movie) => openBooking(session, movie)

  const clearFilters = () => update({ venues: [], formats: [], languages: [], bands: [] })

  return (
    <div className="flex items-start gap-12.75 px-12.75 pt-29.5 pb-20">
      {/* Left: title and the sticky filter panel. 8px wider than Figma's 320
          to make room for the inset scrollbar. */}
      <div className="flex w-82 shrink-0 flex-col gap-9 self-stretch">
        <div className="flex flex-col gap-1.5">
          <h1 className="type-h1 text-foreground">Sessions</h1>
          <p className="type-body-m text-muted-foreground">Browse showtimes across all venues</p>
        </div>
        <div className="flex-1">
          <FilterPanel options={options} filters={filters} activeCount={activeCount} update={update} />
        </div>
      </div>

      {/* Right: count and sort, the films, pagination. Starts level with the panel. */}
      <section aria-busy={isLoading} className="mt-20.75 flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          {isLoading ? (
            <Skeleton className="w-fit rounded-sm">
              <span className="type-label-m">Showing 12 sessions</span>
            </Skeleton>
          ) : (
            <p className="type-label-m text-foreground">
              {data?.meta.totalSessions
                ? `Showing ${data.meta.totalSessions} ${data.meta.totalSessions === 1 ? "session" : "sessions"}`
                : "No sessions found"}
            </p>
          )}
          {options && <SortSelect sorts={options.sorts} value={filters.sort} onChange={(sort) => update({ sort })} />}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-8">
            {Array.from({ length: 3 }, (_, index) => (
              <MovieSessionsGroupSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <ErrorMessage title="Couldn't load sessions" onRetry={() => refetch()} className="py-16" />
        ) : !data?.data.length ? (
          // The brief: "No sessions found" when nothing matches.
          <StateMessage
            icon={<MagnifyingGlass className="size-5" />}
            title="No sessions found"
            body={
              activeCount
                ? "Nothing matches these filters on this date. Try removing some."
                : "There are no showtimes on this date. Try another day."
            }
            action={
              activeCount > 0 && (
                <Button variant="transparent" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
            className="py-16"
          />
        ) : (
          <>
            <div className="flex flex-col gap-8">
              {data.data.map((group, index) => (
                <div key={group.movie.id} className="flex flex-col gap-8">
                  {index > 0 && <div className="h-px w-full bg-raised" />}
                  <MovieSessionsGroup group={group} onSelect={(session) => onSelectSession(session, group.movie)} />
                </div>
              ))}
            </div>

            {data.meta.lastPage > 1 && (
              <div className="flex justify-center pt-8">
                <Pagination
                  current={data.meta.currentPage}
                  last={data.meta.lastPage}
                  onChange={(page) => update({ page })}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default Sessions
