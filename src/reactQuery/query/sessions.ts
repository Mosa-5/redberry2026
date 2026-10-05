import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { filterOptions } from "@/API/requests/Sessions"
import type { FilterOptions } from "@/API/types"
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
