import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { tickets } from "@/api/requests/tickets"
import type { Order } from "@/api/types"
import type { HookOptions } from "@/reactQuery/types"

/**
 * The user's orders for My Tickets. One request for both tabs: the profile
 * tab's count, the Upcoming/Past counts and both lists all come from it.
 * New orders invalidate ["tickets"]; a refund writes the returned order
 * into it; a login removes it, so the next account starts empty.
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
