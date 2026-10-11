import { useEffect } from "react"
import { Link, useParams } from "react-router"

import type { Session } from "@/api/types"
import Popcorn from "@/assets/icons/popcorn.svg?react"
import { useBooking } from "@/components/booking/booking-context"
import { MovieBanner } from "@/components/movie/movie-banner"
import { MovieDetails } from "@/components/movie/movie-details"
import { MovieSessions } from "@/components/movie/movie-sessions"
import { Skeleton } from "@/components/skeleton"
import { ErrorMessage, StateMessage } from "@/components/state-message"
import { Button } from "@/components/ui/button"
import { recordView } from "@/lib/recently-viewed"
import { useGetMe } from "@/reactQuery/query/auth"
import { useGetMovieDetail } from "@/reactQuery/query/catalogue"

/** Banner-sized block plus the two columns' headings while the film loads. */
const MovieSkeleton = () => {
  return (
    <>
      <Skeleton className="h-141.75 w-full rounded-none" />
      <div className="mt-8.5 flex gap-2.5 px-12.75">
        <div className="flex flex-1 flex-col gap-3.5">
          <Skeleton className="h-6 w-24 rounded-sm" />
          <div className="flex gap-1.75">
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton key={index} className="size-20" />
            ))}
          </div>
        </div>
        <div className="flex w-110.25 flex-col gap-4.25 px-6.5">
          <Skeleton className="h-6 w-20 rounded-sm" />
          <Skeleton className="h-9 w-full rounded-sm" />
          <Skeleton className="h-9 w-full rounded-sm" />
        </div>
      </div>
    </>
  )
}

/** Film details page (Figma "Movie inside page", 148:3565). Open to everyone. */
const Movie = () => {
  const { slug } = useParams()
  const { data: movie, isLoading, isError, error, refetch } = useGetMovieDetail({}, slug)
  const { data: user } = useGetMe()
  const { openBooking } = useBooking()

  // Opening a film is what Recently viewed tracks.
  useEffect(() => {
    if (movie) recordView(movie)
  }, [movie])

  // Login and the profile check happen inside openBooking.
  const onSelectSession = (session: Session) => {
    if (movie) openBooking(session, movie)
  }

  if (isLoading) return <MovieSkeleton />

  if (isError) {
    const notFound = error.response?.status === 404
    return (
      <div className="grid min-h-141.75 place-items-center pt-27.75">
        {notFound ? (
          <StateMessage
            icon={<Popcorn className="size-6" />}
            title="Film not found"
            body="It may have been removed, or the link is wrong."
            action={
              <Button variant="transparent" asChild>
                <Link to="/">Back to home</Link>
              </Button>
            }
          />
        ) : (
          <ErrorMessage title="Couldn't load this film" onRetry={() => refetch()} />
        )}
      </div>
    )
  }

  if (!movie) return null

  return (
    <>
      <MovieBanner movie={movie} />
      <div className="mt-8.5 flex gap-2.5 px-12.75 pb-20">
        {/* Keyed by film so the chosen day resets when moving between films. */}
        <MovieSessions key={movie.id} movie={movie} viewerAge={user?.age ?? null} onSelect={onSelectSession} />
        <MovieDetails movie={movie} />
      </div>
    </>
  )
}

export default Movie
