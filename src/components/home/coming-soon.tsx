import { Link } from "react-router"

import Bell from "@/assets/icons/bell.svg?react"
import { CardMedium, CardMediumSkeleton } from "@/components/cards/card-medium"
import { MovieRow } from "@/components/movie-row"
import { ErrorMessage, StateMessage } from "@/components/state-message"
import { useGetComingSoonMovies } from "@/reactQuery/queries/catalogue"

type ComingSoonProps = {
  /** Caps how many titles the API returns. Omit for the whole catalogue. */
  limit?: number
}

/**
 * "COMING SOON..." on the home page (Figma 139:3033). These titles have no
 * sessions, so each card offers Notify Me rather than a ticket link.
 */
export const ComingSoon = ({ limit }: ComingSoonProps) => {
  const { data: movies = [], isLoading, isError, refetch } = useGetComingSoonMovies({}, limit)

  return (
    <section className="flex flex-col gap-6 px-17.5" aria-busy={isLoading}>
      <div className="flex items-end justify-between">
        <h2 className="type-h1 text-foreground">COMING SOON...</h2>
        <Link to="/sessions" className="type-label-m text-primary">
          See all
        </Link>
      </div>

      {isLoading ? (
        <MovieRow gap={20}>
          {Array.from({ length: 4 }, (_, index) => (
            <CardMediumSkeleton key={index} />
          ))}
        </MovieRow>
      ) : isError ? (
        <ErrorMessage
          title="Couldn't load upcoming films"
          onRetry={() => refetch()}
          className="py-6"
        />
      ) : movies.length === 0 ? (
        <StateMessage
          icon={<Bell className="size-5" />}
          title="No upcoming films announced"
          body="New titles appear here as soon as they're scheduled."
          className="py-6"
        />
      ) : (
        <MovieRow gap={20}>
          {movies.map((movie) => (
            <CardMedium key={movie.id} movie={movie} />
          ))}
        </MovieRow>
      )}
    </section>
  )
}
