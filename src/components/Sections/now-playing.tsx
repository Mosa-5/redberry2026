import { useEffect, useState } from "react"

import { nowPlayingMovies } from "@/API/requests/Catalogue"
import type { Movie } from "@/API/types"
import { CardBig } from "@/components/Cards/card-big"
import { MovieRow } from "@/components/movie-row"

type NowPlayingProps = {
  /** Caps how many titles the API returns. Omit for the whole catalogue. */
  limit?: number
}

/** "NOW PLAYING" on the home page (Figma 139:3024). */
export const NowPlaying = ({ limit }: NowPlayingProps) => {
  const [movies, setMovies] = useState<Movie[]>([])

  useEffect(() => {
    let ignore = false
    nowPlayingMovies(limit).then((movies) => {
      if (!ignore) setMovies(movies)
    })
    return () => {
      ignore = true
    }
  }, [limit])

  return (
    <section className="flex flex-col gap-6 px-17.5">
      <div className="flex items-end justify-between">
        <h2 className="type-h1 text-foreground">NOW PLAYING</h2>
        <a href="/sessions" className="type-label-m text-primary">
          See all
        </a>
      </div>

      <MovieRow gap={17}>
        {movies.map((movie) => (
          <CardBig key={movie.id} movie={movie} synopsis={movie.synopsis} />
        ))}
      </MovieRow>
    </section>
  )
}
