import { skipToken, useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import {
  comingSoonMovies,
  featuredMovies,
  movieDetail,
  nowPlayingMovies,
  searchMovies,
} from "@/API/requests/Catalogue"
import type { Movie, MovieDetail } from "@/API/types"
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
