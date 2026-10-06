import { useState } from "react"
import { cn } from "cn"

import type { MovieDetail, Session, VenueSessions } from "@/API/types"
import Calendar from "@/assets/icons/calendar.svg?react"
import { SessionTicket } from "@/components/Movie/session-ticket"
import { NotifyButton } from "@/components/notify-button"
import { Skeleton } from "@/components/skeleton"
import { ErrorMessage, StateMessage } from "@/components/state-message"
import { fromIsoDate, toIsoDate } from "@/lib/dates"
import { releaseLabel } from "@/lib/format"
import { useGetMovieSessions } from "@/reactQuery/query/catalogue"

/** Today and the six days after it, as "YYYY-MM-DD" — the brief's "next 7 days". */
const nextSevenDays = () =>
  Array.from({ length: 7 }, (_, offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return toIsoDate(date)
  })

const weekdayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short" })

/** A venue's sessions split by hall, keeping the API's order (sorted by time). */
const byHall = (sessions: Session[]) => {
  const halls = new Map<string, Session[]>()
  sessions.forEach((session) => {
    halls.set(session.hall.name, [...(halls.get(session.hall.name) ?? []), session])
  })
  return [...halls.entries()]
}

/** Day tile (Figma Days, 119:3614). Hover is identical to default in Figma; selected turns red and widens. */
const DayTile = ({ date, selected, onSelect }: { date: string; selected: boolean; onSelect: () => void }) => {
  const day = fromIsoDate(date)

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex h-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-foreground transition-all",
        selected ? "w-27.25 bg-primary" : "w-20 bg-card"
      )}
    >
      <span className="type-label-s">{weekdayFormat.format(day)}</span>
      <span className="type-h3">{day.getDate()}</span>
    </button>
  )
}

const VenueGroup = ({
  group,
  disabled,
  onSelect,
}: {
  group: VenueSessions
  disabled: boolean
  onSelect: (session: Session) => void
}) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="type-button text-foreground">{group.venue.name}</h3>
      <div className="flex flex-wrap gap-2.5">
        {byHall(group.sessions).map(([hall, sessions]) => (
          <div key={hall} className="flex flex-col gap-2.25 rounded-[1.125rem] bg-card p-3.75">
            <p className="type-label-s text-foreground">Hall {hall}</p>
            <div className="flex flex-wrap gap-2.25">
              {sessions.map((session) => (
                <SessionTicket key={session.id} session={session} disabled={disabled} onSelect={onSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** One venue with one hall of two tickets, the shape of a typical day. */
const SessionsSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-fit rounded-sm">
        <span className="type-button">Galleria Tbilisi</span>
      </Skeleton>
      <div className="flex w-fit flex-col gap-2.25 rounded-[1.125rem] bg-card p-3.75">
        <Skeleton className="w-fit rounded-sm">
          <span className="type-label-s">Hall A</span>
        </Skeleton>
        <div className="flex gap-2.25">
          <Skeleton className="h-20.25 w-61 rounded-md" />
          <Skeleton className="h-20.25 w-61 rounded-md" />
        </div>
      </div>
    </div>
  )
}

type MovieSessionsProps = {
  movie: MovieDetail
  /**
   * Signed-in user's age, when known. Below the film's minimum, sessions are
   * shown disabled with the brief's explanation; guests keep them clickable
   * and are checked after signing in.
   */
  viewerAge: number | null
  onSelect: (session: Session) => void
}

/** Sessions column (Figma 148:3931): week count, day picker, the day's sessions by venue and hall. */
export const MovieSessions = ({ movie, viewerAge, onSelect }: MovieSessionsProps) => {
  const [dates] = useState(nextSevenDays)
  const [selectedDate, setSelectedDate] = useState(dates[0])
  const days = useGetMovieSessions(movie.slug, dates, !movie.isComingSoon)

  const selected = days[dates.indexOf(selectedDate)]
  const weekTotal = days.reduce(
    (total, day) => total + (day.data ?? []).reduce((sum, group) => sum + group.sessions.length, 0),
    0
  )
  const weekLoading = days.some((day) => day.isLoading)
  const ageGated = viewerAge !== null && viewerAge < movie.ageRating.minAge

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6.75 pb-6.5">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.75">
          <h2 className="type-h2 text-foreground">Sessions</h2>
          {weekLoading ? (
            <Skeleton className="w-fit rounded-sm">
              <span className="type-body-s">22 sessions over the next seven days</span>
            </Skeleton>
          ) : (
            !movie.isComingSoon && (
              <p className="type-body-s text-muted-foreground">
                {weekTotal} {weekTotal === 1 ? "session" : "sessions"} over the next seven days
              </p>
            )
          )}
        </div>

        {/* Not in Figma; the brief gives the wording. Styled like the rating note. */}
        {ageGated && (
          <p className="w-fit rounded-md bg-tint-warning px-3.25 py-2.25 type-body-s text-warning">
            This film is rated {movie.ageRating.code}. You cannot buy tickets for it with this account.
          </p>
        )}

        {!movie.isComingSoon && (
          <div className="flex gap-1.75">
            {dates.map((date) => (
              <DayTile
                key={date}
                date={date}
                selected={date === selectedDate}
                onSelect={() => setSelectedDate(date)}
              />
            ))}
          </div>
        )}
      </div>

      {movie.isComingSoon ? (
        <StateMessage
          icon={<Calendar className="size-5" />}
          title="Not in cinemas yet"
          body={`Sessions open when it's released — ${releaseLabel(movie.releaseDate).toLowerCase()}.`}
          action={<NotifyButton movie={movie} />}
          className="w-fit items-start text-left"
        />
      ) : selected.isLoading ? (
        <SessionsSkeleton />
      ) : selected.isError ? (
        <ErrorMessage
          title="Couldn't load sessions"
          onRetry={() => selected.refetch()}
          className="w-fit items-start text-left"
        />
      ) : !selected.data?.length ? (
        // The brief: a message when the chosen date has no sessions.
        <StateMessage
          icon={<Calendar className="size-5" />}
          title="No sessions on this day"
          body="Pick another date to see its showtimes."
          className="w-fit items-start text-left"
        />
      ) : (
        selected.data.map((group) => (
          <VenueGroup key={group.venue.id} group={group} disabled={ageGated} onSelect={onSelect} />
        ))
      )}
    </section>
  )
}
