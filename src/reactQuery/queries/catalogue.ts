import { skipToken, useQueries, useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import {
  comingSoonMovies,
  featuredMovies,
  movieDetail,
  movieSessions,
  nowPlayingMovies,
  searchMovies,
} from "@/api/requests/catalogue"
import type { Movie, MovieDetail, VenueSessions } from "@/api/types"
import type { HookOptions } from "@/reactQuery/types"

export const useGetFeaturedMovies = <T = Movie[]>(
  { queryOptions }: HookOptions<Movie[], T> = {}
): UseQueryResult<T, AxiosError> => {
  return useQuery<Movie[], AxiosError, T>({
    queryKey: ["featuredMovies"],
    queryFn: featuredMovies,
    ...queryOptions,
  })
}

export const useGetNowPlayingMovies = <T = Movie[]>(
  { queryOptions }: HookOptions<Movie[], T> = {},
  limit?: number
): UseQueryResult<T, AxiosError> => {
  return useQuery<Movie[], AxiosError, T>({
    queryKey: ["nowPlayingMovies", limit],
    queryFn: () => nowPlayingMovies(limit),
    ...queryOptions,
  })
}

export const useGetComingSoonMovies = <T = Movie[]>(
  { queryOptions }: HookOptions<Movie[], T> = {},
  limit?: number
): UseQueryResult<T, AxiosError> => {
  return useQuery<Movie[], AxiosError, T>({
    queryKey: ["comingSoonMovies", limit],
    queryFn: () => comingSoonMovies(limit),
    ...queryOptions,
  })
}

/** Pass the debounced query, not the raw input — each value is its own cache entry. */
export const useGetSearch = <T = Movie[]>(
  { queryOptions }: HookOptions<Movie[], T> = {},
  query: string
): UseQueryResult<T, AxiosError> => {
  return useQuery<Movie[], AxiosError, T>({
    queryKey: ["search", query],
    // A blank query returns [] from the API anyway, so skip the request.
    queryFn: query ? () => searchMovies(query) : skipToken,
    ...queryOptions,
  })
}

export const useGetMovieDetail = <T = MovieDetail>(
  { queryOptions }: HookOptions<MovieDetail, T> = {},
  slug: string | undefined
): UseQueryResult<T, AxiosError> => {
  return useQuery<MovieDetail, AxiosError, T>({
    queryKey: ["movie", slug],
    queryFn: slug ? () => movieDetail(slug) : skipToken,
    ...queryOptions,
  })
}

/**
 * A film's sessions for several dates at once — one query per date, in
 * parallel. The details page needs the week's total for its subtitle, and
 * having every day cached makes switching days instant. Pass `enabled:
 * false` for a coming soon title, which has no sessions on any date.
 */
export const useGetMovieSessions = (slug: string | undefined, dates: string[], enabled = true) => {
  return useQueries({
    queries: dates.map((date) => ({
      queryKey: ["movieSessions", slug, date],
      queryFn: slug && enabled ? () => movieSessions(slug, date) : skipToken,
    })),
  }) as UseQueryResult<VenueSessions[], AxiosError>[]
}
