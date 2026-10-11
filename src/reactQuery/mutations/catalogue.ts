import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { notifyMovie } from "@/api/requests/catalogue"
import type { ApiError, Movie, MovieDetail } from "@/api/types"

export const useNotifyMovie = () => {
  const queryClient = useQueryClient()
  return useMutation<void, AxiosError<ApiError>, string>({
    mutationKey: ["notifyMovie"],
    mutationFn: notifyMovie,
    // The response only confirms the subscription, so flip isNotified in the
    // cached lists and detail directly rather than refetching them.
    onSuccess: (_, slug) => {
      queryClient.setQueriesData<Movie[]>({ queryKey: ["comingSoonMovies"] }, (movies) =>
        movies?.map((movie) => (movie.slug === slug ? { ...movie, isNotified: true } : movie))
      )
      queryClient.setQueryData<MovieDetail>(["movie", slug], (movie) => movie && { ...movie, isNotified: true })
    },
  })
}
