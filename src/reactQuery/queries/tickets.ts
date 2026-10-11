import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { tickets } from "@/api/requests/tickets"
import type { Order } from "@/api/types"
import type { HookOptions } from "@/reactQuery/types"

/**
 * The user's orders for My Tickets. One request for both tabs: the profile
 * tab's count, the Upcoming/Past counts and both lists all come from it.
 * New orders and refunds invalidate ["tickets"].
 */
export const useGetTickets = <T = Order[]>(
  { queryOptions }: HookOptions<Order[], T> = {}
): UseQueryResult<T, AxiosError> => {
  return useQuery<Order[], AxiosError, T>({
    queryKey: ["tickets"],
    queryFn: tickets,
    ...queryOptions,
  })
}
