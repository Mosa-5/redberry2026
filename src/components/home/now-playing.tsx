import { Link } from "react-router"

import Popcorn from "@/assets/icons/popcorn.svg?react"
import { CardBig, CardBigSkeleton } from "@/components/cards/card-big"
import { MovieRow } from "@/components/movie-row"
import { ErrorMessage, StateMessage } from "@/components/state-message"
import { useGetNowPlayingMovies } from "@/reactQuery/queries/catalogue"

type NowPlayingProps = {
  /** Caps how many titles the API returns. Omit for the whole catalogue. */
  limit?: number
}

/** "NOW PLAYING" on the home page (Figma 139:3024). */
export const NowPlaying = ({ limit }: NowPlayingProps) => {
  const { data: movies = [], isLoading, isError, refetch } = useGetNowPlayingMovies({}, limit)

  return (
    <section className="flex flex-col gap-6 px-17.5" aria-busy={isLoading}>
      <div className="flex items-end justify-between">
        <h2 className="type-h1 text-foreground">NOW PLAYING</h2>
        <Link to="/sessions" className="type-label-m text-primary">
          See all
        </Link>
      </div>

      {isLoading ? (
        <MovieRow gap={17}>
          {Array.from({ length: 6 }, (_, index) => (
            <CardBigSkeleton key={index} />
          ))}
        </MovieRow>
      ) : isError ? (
        // Same height as the row, so the page doesn't jump when it recovers.
        <ErrorMessage
          title="Couldn't load films"
          onRetry={() => refetch()}
          className="h-113 justify-center"
        />
      ) : movies.length === 0 ? (
        <StateMessage
          icon={<Popcorn className="size-6" />}
          title="Nothing is playing right now"
          body="New sessions are added regularly. Check back soon."
          className="h-113 justify-center"
        />
      ) : (
        <MovieRow gap={17}>
          {movies.map((movie) => (
            <CardBig key={movie.id} movie={movie} synopsis={movie.synopsis} />
          ))}
        </MovieRow>
      )}
    </section>
  )
}
