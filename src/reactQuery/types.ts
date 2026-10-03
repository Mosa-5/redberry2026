import type { UseQueryOptions } from "@tanstack/react-query"
import type { AxiosError } from "axios"

/**
 * What every query hook accepts. `queryKey` and `queryFn` are left out
 * because the hook owns cache identity; `T` is the type after `select`.
 */
export type HookOptions<TData, T = TData> = {
  queryOptions?: Omit<UseQueryOptions<TData, AxiosError, T>, "queryKey" | "queryFn">
}
