import { CardMedium } from "@/components/Cards/card-medium"
import { MovieRow } from "@/components/movie-row"
import { useGetComingSoonMovies } from "@/reactQuery/query/catalogue"

type ComingSoonProps = {
  /** Caps how many titles the API returns. Omit for the whole catalogue. */
  limit?: number
}

/**
 * "COMING SOON..." on the home page (Figma 139:3033). These titles have no
 * sessions, so each card offers Notify Me rather than a ticket link.
 */
export const ComingSoon = ({ limit }: ComingSoonProps) => {
  const { data: movies = [] } = useGetComingSoonMovies({}, limit)

  return (
    <section className="flex flex-col gap-6 px-17.5">
      <div className="flex items-end justify-between">
        <h2 className="type-h1 text-foreground">COMING SOON...</h2>
        <a href="/sessions" className="type-label-m text-primary">
          See all
        </a>
      </div>

      <MovieRow gap={20}>
        {movies.map((movie) => (
          // TODO: wire onNotify to POST /movies/{movie}/notify
          <CardMedium key={movie.id} movie={movie} notified={movie.isNotified} />
        ))}
      </MovieRow>
    </section>
  )
}
