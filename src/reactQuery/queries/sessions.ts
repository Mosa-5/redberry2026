import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { filterOptions, sessions, type SessionFilters } from "@/api/requests/sessions"
import type { FilterOptions, SessionsPage } from "@/api/types"
import type { HookOptions } from "@/reactQuery/types"

export const useGetFilterOptions = <T = FilterOptions>(
  { queryOptions }: HookOptions<FilterOptions, T> = {}
): UseQueryResult<T, AxiosError> => {
  return useQuery<FilterOptions, AxiosError, T>({
    queryKey: ["filterOptions"],
    queryFn: filterOptions,
    // Venues and ratings change rarely; no need to refetch within a visit.
    staleTime: Infinity,
    ...queryOptions,
  })
}

/**
 * The Sessions page list. The whole filter object is the key, so every
 * combination is its own cache entry and Back re-shows a previous view
 * instantly.
 */
export const useGetSessions = <T = SessionsPage>(
  { queryOptions }: HookOptions<SessionsPage, T> = {},
  filters: SessionFilters
): UseQueryResult<T, AxiosError> => {
  return useQuery<SessionsPage, AxiosError, T>({
    queryKey: ["sessions", filters],
    queryFn: () => sessions(filters),
    ...queryOptions,
  })
}
